'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { socialSchema } from '@/lib/validation'
import type { FormState } from '@/actions/profile'

async function parseSocial(formData: FormData) {
  const raw = {
    type: formData.get('type'),
    url: formData.get('url'),
    label: formData.get('label'),
    visible: formData.get('visible') === 'on',
  }
  return socialSchema.safeParse(raw)
}

export async function createSocialLink(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser()
  const parsed = await parseSocial(formData)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const count = await db.socialLink.count({ where: { userId: user.id } })

  try {
    await db.socialLink.create({
      data: {
        userId: user.id,
        type: parsed.data.type,
        url: parsed.data.url,
        label: parsed.data.label || null,
        visible: parsed.data.visible ?? true,
        orderIndex: count,
      },
    })
  } catch (error) {
    console.error('createSocialLink failed', error)
    return { message: 'Something went wrong while saving the link. Please try again.' }
  }

  revalidatePath('/dashboard/portfolio/social')
  return { success: true, message: 'Link added.' }
}

export async function updateSocialLink(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser()
  const id = String(formData.get('id') ?? '')
  const parsed = await parseSocial(formData)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const result = await db.socialLink.updateMany({
    where: { id, userId: user.id },
    data: {
      type: parsed.data.type,
      url: parsed.data.url,
      label: parsed.data.label || null,
      visible: parsed.data.visible ?? true,
    },
  })
  if (result.count === 0) return { message: 'Link not found.' }

  revalidatePath('/dashboard/portfolio/social')
  return { success: true, message: 'Link updated.' }
}

export async function deleteSocialLink(id: string): Promise<void> {
  const user = await requireUser()
  await db.socialLink.deleteMany({ where: { id, userId: user.id } })
  revalidatePath('/dashboard/portfolio/social')
}

export async function toggleSocialLinkVisibility(id: string): Promise<void> {
  const user = await requireUser()
  const link = await db.socialLink.findFirst({
    where: { id, userId: user.id },
    select: { visible: true },
  })
  if (!link) return
  await db.socialLink.updateMany({
    where: { id, userId: user.id },
    data: { visible: !link.visible },
  })
  revalidatePath('/dashboard/portfolio/social')
}

export async function reorderSocialLinks(ids: string[]): Promise<void> {
  const user = await requireUser()
  
  // Prevent DoS with excessive array sizes
  if (ids.length > 100) {
    throw new Error('Too many items to reorder')
  }
  
  const rows = await db.socialLink.findMany({
    where: { id: { in: ids }, userId: user.id },
    select: { id: true },
  })
  const owned = new Set(rows.map((r) => r.id))
  const ordered = ids.filter((id) => owned.has(id))
  await db.$transaction(
    ordered.map((id, index) =>
      db.socialLink.updateMany({ where: { id, userId: user.id }, data: { orderIndex: index } })
    )
  )
  revalidatePath('/dashboard/portfolio/social')
}
