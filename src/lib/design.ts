import type { CSSProperties } from 'react'

export type DesignColorKey = 'primary' | 'background' | 'text' | 'accent'
export type DesignPalette = Record<DesignColorKey, string>

export type DesignPresetId = 'IVORY' | 'MIDNIGHT' | 'FOREST' | 'OCEAN' | 'SUNSET' | 'BLOOM'

export type SectionId = 'projects' | 'experience' | 'skills' | 'education' | 'contact'

export const SECTION_IDS: SectionId[] = ['projects', 'experience', 'skills', 'education', 'contact']

export type SectionColumns = 1 | 2 | 3

/** Sensible starting layout per section. */
export function defaultColumnsFor(id: SectionId): SectionColumns {
  if (id === 'projects' || id === 'skills') return 2
  return 1
}

export const SECTION_LABELS: Record<SectionId, string> = {
  projects: 'Projects',
  experience: 'Experience',
  skills: 'Skills',
  education: 'Education',
  contact: 'Contact',
}

export const DESIGN_COLOR_LABELS: Record<DesignColorKey, string> = {
  primary: 'Primary',
  background: 'Background',
  text: 'Text',
  accent: 'Accent',
}

export const designPresets: { id: DesignPresetId; name: string; palette: DesignPalette }[] = [
  {
    id: 'IVORY',
    name: 'Ivory',
    palette: { primary: '#0f766e', background: '#faf9f7', text: '#1c1917', accent: '#efece7' },
  },
  {
    id: 'MIDNIGHT',
    name: 'Midnight',
    palette: { primary: '#38bdf8', background: '#0f172a', text: '#f1f5f9', accent: '#1e293b' },
  },
  {
    id: 'FOREST',
    name: 'Forest',
    palette: { primary: '#15803d', background: '#f6f8f4', text: '#1a2e22', accent: '#e7efe4' },
  },
  {
    id: 'OCEAN',
    name: 'Ocean',
    palette: { primary: '#2563eb', background: '#f5f8ff', text: '#0f172a', accent: '#e8f0fe' },
  },
  {
    id: 'SUNSET',
    name: 'Sunset',
    palette: { primary: '#c2410c', background: '#fdf8f4', text: '#292524', accent: '#fdefe5' },
  },
  {
    id: 'BLOOM',
    name: 'Bloom',
    palette: { primary: '#be185d', background: '#fdf7fb', text: '#3b1d31', accent: '#f9eaf4' },
  },
]

export const bodyFonts = [
  { id: 'system', name: 'System (Geist)', family: null },
  { id: 'inter', name: 'Inter', family: 'Inter:wght@400..800' },
  { id: 'manrope', name: 'Manrope', family: 'Manrope:wght@400..800' },
  { id: 'dm-sans', name: 'DM Sans', family: 'DM+Sans:wght@400..700' },
  { id: 'source-sans-3', name: 'Source Sans 3', family: 'Source+Sans+3:wght@400..700' },
  { id: 'lora', name: 'Lora', family: 'Lora:wght@400..700' },
  { id: 'ibm-plex-sans', name: 'IBM Plex Sans', family: 'IBM+Plex+Sans:wght@400..700' },
  { id: 'nunito-sans', name: 'Nunito Sans', family: 'Nunito+Sans:wght@400..800' },
] as const

export const headingFonts = [
  { id: 'system', name: 'System (Geist)', family: null },
  { id: 'space-grotesk', name: 'Space Grotesk', family: 'Space+Grotesk:wght@400..700' },
  { id: 'sora', name: 'Sora', family: 'Sora:wght@400..800' },
  { id: 'poppins', name: 'Poppins', family: 'Poppins:wght@400;500;600;700' },
  { id: 'archivo', name: 'Archivo', family: 'Archivo:wght@400..800' },
  { id: 'bricolage-grotesque', name: 'Bricolage Grotesque', family: 'Bricolage+Grotesque:wght@400..800' },
  { id: 'playfair-display', name: 'Playfair Display', family: 'Playfair+Display:wght@400..900' },
  { id: 'dm-serif-display', name: 'DM Serif Display', family: 'DM+Serif+Display' },
  { id: 'fraunces', name: 'Fraunces', family: 'Fraunces:wght@400..800' },
] as const

export type BodyFontId = (typeof bodyFonts)[number]['id']
export type HeadingFontId = (typeof headingFonts)[number]['id']

const allFonts = [...bodyFonts, ...headingFonts]

export function isBodyFontId(id: string): id is BodyFontId {
  return bodyFonts.some((f) => f.id === id)
}

export function isHeadingFontId(id: string): id is HeadingFontId {
  return headingFonts.some((f) => f.id === id)
}

const SYSTEM_STACK = 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif'

export function getFontStack(id: string): string {
  const font = allFonts.find((f) => f.id === id)
  if (!font || font.id === 'system') return SYSTEM_STACK
  return `'${font.name}', ui-sans-serif, system-ui, sans-serif`
}

export function fontCssUrl(id: string): string | null {
  const font = allFonts.find((f) => f.id === id)
  if (!font || !font.family) return null
  return `https://fonts.googleapis.com/css2?family=${font.family}&display=swap`
}

export const CTA_SOCIAL_TYPES = ['GITHUB', 'LINKEDIN', 'INSTAGRAM', 'X', 'YOUTUBE', 'EMAIL', 'WEBSITE'] as const
export type CtaSocialType = (typeof CTA_SOCIAL_TYPES)[number]

export const CTA_SOCIAL_LABELS: Record<CtaSocialType, string> = {
  GITHUB: 'GitHub',
  LINKEDIN: 'LinkedIn',
  INSTAGRAM: 'Instagram',
  X: 'X',
  YOUTUBE: 'YouTube',
  EMAIL: 'Email',
  WEBSITE: 'Website',
}

export type HeaderCtaAction =
  | { type: 'scroll'; section: SectionId }
  | { type: 'url'; url: string }
  | { type: 'email' }
  | { type: 'social'; social: CtaSocialType }

export type HeaderCta = { text: string; action: HeaderCtaAction }

export type DesignState = {
  preset: DesignPresetId | 'CUSTOM'
  palette: DesignPalette
  typography: { body: BodyFontId; heading: HeadingFontId }
  layout: { contentWidth: 'narrow' | 'default' | 'wide'; spacing: 'compact' | 'comfortable' | 'spacious' }
  buttons: { shape: 'rounded' | 'squarish'; style: 'solid' | 'outline' }
  sections: { id: SectionId; visible: boolean; columns: SectionColumns }[]
  header: { cta: HeaderCta | null }
}

export const DEFAULT_SECTIONS: DesignState['sections'] = SECTION_IDS.map((id) => ({
  id,
  visible: true,
  columns: defaultColumnsFor(id),
}))

export const DEFAULT_DESIGN: DesignState = {
  preset: 'IVORY',
  palette: designPresets[0].palette,
  typography: { body: 'system', heading: 'system' },
  layout: { contentWidth: 'default', spacing: 'comfortable' },
  buttons: { shape: 'rounded', style: 'outline' },
  sections: DEFAULT_SECTIONS,
  header: { cta: null },
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/

export function isValidHexColor(value: string): boolean {
  return HEX_RE.test(value)
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.round(Math.min(255, Math.max(0, v)))
  return `#${[clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

/** Mix two hex colors. weight 0 = a, 1 = b. */
export function mix(a: string, b: string, weight: number): string {
  const [ar, ag, ab] = hexToRgb(a)
  const [br, bg, bb] = hexToRgb(b)
  return rgbToHex(
    ar + (br - ar) * weight,
    ag + (bg - ag) * weight,
    ab + (bb - ab) * weight
  )
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Best readable foreground for a given background color. */
export function readableOn(hex: string): string {
  return luminance(hex) > 0.45 ? '#111111' : '#ffffff'
}

const WIDTH_SCALE = { narrow: '0.85', default: '1', wide: '1.15' } as const
const SECTION_Y = { compact: '2.5rem', comfortable: '3.5rem', spacious: '5rem' } as const
const BTN_RADIUS = { rounded: '9999px', squarish: '0.375rem' } as const

/** Per-portfolio design → the CSS variables the templates are built on. */
export function designToCssVars(design: DesignState): CSSProperties {
  const { primary, background, text, accent } = design.palette
  const primaryFg = readableOn(primary)
  const primaryHover = mix(primary, primaryFg === '#ffffff' ? '#ffffff' : '#000000', 0.12)
  return {
    '--background': background,
    '--surface': mix(background, text, 0.035),
    '--surface-muted': mix(background, text, 0.07),
    '--surface-strong': mix(background, text, 0.13),
    '--foreground': text,
    '--muted-foreground': mix(background, text, 0.55),
    '--border': mix(background, text, 0.12),
    '--border-strong': mix(background, text, 0.22),
    '--primary': primary,
    '--primary-hover': primaryHover,
    '--primary-foreground': primaryFg,
    '--accent': accent,
    '--ring': primary,
    '--pf-font-body': getFontStack(design.typography.body),
    '--pf-font-heading': getFontStack(design.typography.heading),
    '--pf-width-scale': WIDTH_SCALE[design.layout.contentWidth],
    '--pf-section-y': SECTION_Y[design.layout.spacing],
    '--pf-btn-radius': BTN_RADIUS[design.buttons.shape],
  } as CSSProperties
}

export function getPresetById(id: string): DesignPalette | null {
  return designPresets.find((p) => p.id === id)?.palette ?? null
}

function parseSections(value: unknown): DesignState['sections'] {
  if (!Array.isArray(value)) return DEFAULT_SECTIONS
  const seen = new Set<SectionId>()
  const ordered: DesignState['sections'] = []
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue
    const candidate = entry as { id?: unknown; visible?: unknown; columns?: unknown }
    if (typeof candidate.id !== 'string' || !SECTION_IDS.includes(candidate.id as SectionId)) continue
    if (seen.has(candidate.id as SectionId)) continue
    seen.add(candidate.id as SectionId)
    const id = candidate.id as SectionId
    ordered.push({
      id,
      visible: candidate.visible !== false,
      columns: candidate.columns === 1 || candidate.columns === 2 || candidate.columns === 3
        ? candidate.columns
        : defaultColumnsFor(id),
    })
  }
  for (const id of SECTION_IDS) {
    if (!seen.has(id)) ordered.push({ id, visible: true, columns: defaultColumnsFor(id) })
  }
  return ordered
}

function parseHeaderCta(value: unknown): HeaderCta | null {
  if (!value || typeof value !== 'object') return null
  const { text, action } = value as { text?: unknown; action?: unknown }
  if (typeof text !== 'string' || !text.trim()) return null
  if (!action || typeof action !== 'object') return null
  const candidate = action as { type?: unknown; section?: unknown; url?: unknown; social?: unknown }
  if (candidate.type === 'scroll') {
    if (typeof candidate.section !== 'string' || !SECTION_IDS.includes(candidate.section as SectionId)) return null
    return { text: text.trim(), action: { type: 'scroll', section: candidate.section as SectionId } }
  }
  if (candidate.type === 'url') {
    if (typeof candidate.url !== 'string' || !candidate.url.trim()) return null
    return { text: text.trim(), action: { type: 'url', url: candidate.url.trim() } }
  }
  if (candidate.type === 'email') {
    return { text: text.trim(), action: { type: 'email' } }
  }
  if (candidate.type === 'social') {
    if (typeof candidate.social !== 'string' || !CTA_SOCIAL_TYPES.includes(candidate.social as CtaSocialType)) return null
    return { text: text.trim(), action: { type: 'social', social: candidate.social as CtaSocialType } }
  }
  return null
}

/** Defensive parse of a stored design JSON value. Falls back to defaults. */
export function parseDesign(value: unknown): DesignState {
  const base: DesignState = {
    ...DEFAULT_DESIGN,
    palette: { ...DEFAULT_DESIGN.palette },
    typography: { ...DEFAULT_DESIGN.typography },
    layout: { ...DEFAULT_DESIGN.layout },
    buttons: { ...DEFAULT_DESIGN.buttons },
    header: { cta: null },
  }
  if (!value || typeof value !== 'object') return base

  const candidate = value as Partial<DesignState> & { palette?: Partial<DesignPalette> }

  const palette = candidate.palette
  if (palette && typeof palette === 'object') {
    const { primary, background, text, accent } = palette
    if ([primary, background, text, accent].every((c) => typeof c === 'string' && isValidHexColor(c))) {
      base.palette = { primary: primary!, background: background!, text: text!, accent: accent! }
    }
  }
  if (
    typeof candidate.preset === 'string' &&
    (candidate.preset === 'CUSTOM' || designPresets.some((p) => p.id === candidate.preset))
  ) {
    base.preset = candidate.preset
  }

  const typography = candidate.typography
  if (typography && typeof typography === 'object') {
    const t = typography as { body?: unknown; heading?: unknown }
    base.typography = {
      body: typeof t.body === 'string' && isBodyFontId(t.body) ? t.body : 'system',
      heading: typeof t.heading === 'string' && isHeadingFontId(t.heading) ? t.heading : 'system',
    }
  }

  const layout = candidate.layout
  if (layout && typeof layout === 'object') {
    const l = layout as { contentWidth?: unknown; spacing?: unknown }
    if (l.contentWidth === 'narrow' || l.contentWidth === 'default' || l.contentWidth === 'wide') {
      base.layout.contentWidth = l.contentWidth
    }
    if (l.spacing === 'compact' || l.spacing === 'comfortable' || l.spacing === 'spacious') {
      base.layout.spacing = l.spacing
    }
  }

  const buttons = candidate.buttons
  if (buttons && typeof buttons === 'object') {
    const b = buttons as { shape?: unknown; style?: unknown }
    if (b.shape === 'rounded' || b.shape === 'squarish') base.buttons.shape = b.shape
    if (b.style === 'solid' || b.style === 'outline') base.buttons.style = b.style
  }

  base.sections = parseSections(candidate.sections)
  if (candidate.header && typeof candidate.header === 'object') {
    base.header = { cta: parseHeaderCta((candidate.header as { cta?: unknown }).cta) }
  }
  return base
}
