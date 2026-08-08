'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import {
  CTA_SOCIAL_TYPES,
  DESIGN_COLOR_LABELS,
  SECTION_IDS,
  designPresets,
  isBodyFontId,
  isHeadingFontId,
  isValidHexColor,
  parseDesign,
  type DesignState,
  type HeaderCta,
  type SectionId,
} from '@/lib/design'

type DesignInput = {
  preset: string
  palette: Record<string, string>
  typography: { body: string; heading: string }
  layout: { contentWidth: string; spacing: string }
  buttons: { shape: string; style: string }
  sections: { id: string; visible: boolean }[]
}

function validateSections(
  input: unknown
): { ok: true; sections: DesignState['sections'] } | { ok: false; message: string } {
  if (!Array.isArray(input)) return { ok: false, message: 'Missing sections.' }
  const seen = new Set<SectionId>()
  const sections: DesignState['sections'] = []
  for (const entry of input) {
    if (!entry || typeof entry !== 'object') return { ok: false, message: 'Invalid section.' }
    const { id, visible, columns } = entry as { id?: unknown; visible?: unknown; columns?: unknown }
    if (typeof id !== 'string' || !SECTION_IDS.includes(id as SectionId)) {
      return { ok: false, message: 'Invalid section.' }
    }
    if (seen.has(id as SectionId)) return { ok: false, message: 'Duplicate section.' }
    seen.add(id as SectionId)
    sections.push({
      id: id as SectionId,
      visible: visible !== false,
      columns: columns === 1 || columns === 2 || columns === 3 ? columns : 1,
    })
  }
  for (const id of SECTION_IDS) {
    if (!seen.has(id)) return { ok: false, message: 'Missing a section in the design.' }
  }
  return { ok: true, sections }
}

function validateHeader(
  input: unknown
): { ok: true; cta: HeaderCta | null } | { ok: false; message: string } {
  if (input === null || input === undefined) return { ok: true, cta: null }
  if (typeof input !== 'object') return { ok: false, message: 'Invalid header.' }
  const cta = (input as { cta?: unknown }).cta
  if (cta === null || cta === undefined) return { ok: true, cta: null }
  if (typeof cta !== 'object') return { ok: false, message: 'Invalid header button.' }
  const { text, action } = cta as { text?: unknown; action?: unknown }
  if (typeof text !== 'string' || !text.trim() || text.length > 40) {
    return { ok: false, message: 'Button text is required (max 40 characters).' }
  }
  if (!action || typeof action !== 'object') return { ok: false, message: 'Invalid button action.' }
  const candidate = action as { type?: unknown; section?: unknown; url?: unknown; social?: unknown }
  if (candidate.type === 'scroll') {
    if (typeof candidate.section !== 'string' || !SECTION_IDS.includes(candidate.section as SectionId)) {
      return { ok: false, message: 'Invalid button target.' }
    }
    return { ok: true, cta: { text: text.trim(), action: { type: 'scroll', section: candidate.section as SectionId } } }
  }
  if (candidate.type === 'url') {
    if (typeof candidate.url !== 'string' || !candidate.url.trim()) {
      return { ok: false, message: 'Enter a URL for the button.' }
    }
    return { ok: true, cta: { text: text.trim(), action: { type: 'url', url: candidate.url.trim() } } }
  }
  if (candidate.type === 'email') {
    return { ok: true, cta: { text: text.trim(), action: { type: 'email' } } }
  }
  if (candidate.type === 'social') {
    if (typeof candidate.social !== 'string' || !CTA_SOCIAL_TYPES.includes(candidate.social as (typeof CTA_SOCIAL_TYPES)[number])) {
      return { ok: false, message: 'Invalid social profile.' }
    }
    return { ok: true, cta: { text: text.trim(), action: { type: 'social', social: candidate.social as (typeof CTA_SOCIAL_TYPES)[number] } } }
  }
  return { ok: false, message: 'Invalid button action.' }
}

export async function updateDesign(input: DesignInput): Promise<{ ok: boolean; message?: string }> {
  const user = await requireUser()

  const preset = designPresets.some((p) => p.id === input.preset) ? input.preset : 'CUSTOM'

  const palette = {
    primary: input.palette.primary,
    background: input.palette.background,
    text: input.palette.text,
    accent: input.palette.accent,
  }
  for (const [key, value] of Object.entries(palette)) {
    if (typeof value !== 'string' || !isValidHexColor(value)) {
      return { ok: false, message: `Invalid color for ${DESIGN_COLOR_LABELS[key as keyof typeof palette]}.` }
    }
  }

  if (!isBodyFontId(input.typography.body)) {
    return { ok: false, message: 'Invalid body font.' }
  }
  if (!isHeadingFontId(input.typography.heading)) {
    return { ok: false, message: 'Invalid heading font.' }
  }
  if (!['narrow', 'default', 'wide'].includes(input.layout.contentWidth)) {
    return { ok: false, message: 'Invalid content width.' }
  }
  if (!['compact', 'comfortable', 'spacious'].includes(input.layout.spacing)) {
    return { ok: false, message: 'Invalid spacing.' }
  }
  if (!['rounded', 'squarish'].includes(input.buttons.shape)) {
    return { ok: false, message: 'Invalid button shape.' }
  }
  if (!['solid', 'outline'].includes(input.buttons.style)) {
    return { ok: false, message: 'Invalid button style.' }
  }

  const sectionsValidation = validateSections(input.sections)
  if (!sectionsValidation.ok) return sectionsValidation

  const portfolio = await db.portfolio.findUnique({
    where: { userId: user.id },
    select: { design: true },
  })
  const existing = parseDesign(portfolio?.design)

  try {
    await db.portfolio.update({
      where: { userId: user.id },
      data: {
        design: {
          preset,
          palette,
          typography: input.typography,
          layout: input.layout,
          buttons: input.buttons,
          sections: sectionsValidation.sections,
          header: existing.header,
        },
      },
    })
  } catch (error) {
    console.error('updateDesign failed', error)
    return { ok: false, message: 'Something went wrong. Please try again.' }
  }

  revalidatePath('/dashboard/design')
  revalidatePath('/dashboard/editor')
  revalidatePath('/dashboard/preview')
  revalidatePath('/dashboard/template')
  revalidatePath('/dashboard')
  return { ok: true }
}

/** Saves page structure: section order + visibility, and the header button. */
export async function updateStructure(input: {
  sections: unknown
  header: unknown
}): Promise<{ ok: boolean; message?: string }> {
  const user = await requireUser()
  const sectionsValidation = validateSections(input.sections)
  if (!sectionsValidation.ok) return sectionsValidation
  const headerValidation = validateHeader(input.header)
  if (!headerValidation.ok) return headerValidation

  const portfolio = await db.portfolio.findUnique({
    where: { userId: user.id },
    select: { design: true },
  })
  const design = parseDesign(portfolio?.design)

  try {
    await db.portfolio.update({
      where: { userId: user.id },
      data: {
        design: {
          ...design,
          sections: sectionsValidation.sections,
          header: { cta: headerValidation.cta },
        },
      },
    })
  } catch (error) {
    console.error('updateStructure failed', error)
    return { ok: false, message: 'Something went wrong. Please try again.' }
  }

  revalidatePath('/dashboard/editor')
  revalidatePath('/dashboard/design')
  revalidatePath('/dashboard/preview')
  revalidatePath('/dashboard/template')
  revalidatePath('/dashboard')
  return { ok: true }
}

/** Pushes the current design draft to the live site. */
export async function publishDesign(): Promise<{ ok: boolean; message?: string }> {
  const user = await requireUser()
  const portfolio = await db.portfolio.findUnique({
    where: { userId: user.id },
    select: { design: true },
  })
  if (!portfolio?.design) return { ok: false, message: 'Nothing to publish yet.' }

  try {
    await db.portfolio.update({
      where: { userId: user.id },
      data: { designPublished: portfolio.design },
    })
  } catch (error) {
    console.error('publishDesign failed', error)
    return { ok: false, message: 'Something went wrong. Please try again.' }
  }

  revalidatePath('/dashboard/design')
  revalidatePath('/dashboard/editor')
  revalidatePath('/[username]')
  return { ok: true }
}
