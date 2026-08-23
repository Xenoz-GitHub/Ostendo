'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { profileSchema } from '@/lib/validation'

export type FormState = {
  errors?: Record<string, string[] | undefined>
  message?: string
  success?: boolean
} | undefined

export async function updateProfile(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser()

  const parsed = profileSchema.safeParse({
    name: formData.get('name'),
    headline: formData.get('headline'),
    bio: formData.get('bio'),
    avatarUrl: formData.get('avatarUrl'),
    university: formData.get('university'),
    major: formData.get('major'),
    graduationYear: formData.get('graduationYear'),
    location: formData.get('location'),
    contactEmail: formData.get('contactEmail'),
    websiteUrl: formData.get('websiteUrl'),
  })
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const {
    name,
    headline,
    bio,
    avatarUrl,
    university,
    major,
    graduationYear,
    location,
    contactEmail,
    websiteUrl,
  } = parsed.data

  try {
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { name: name || null, avatarUrl: avatarUrl || null },
      }),
      db.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          headline: headline || null,
          bio: bio || null,
          university: university || null,
          major: major || null,
          graduationYear,
          location: location || null,
          contactEmail: contactEmail || null,
          websiteUrl: websiteUrl || null,
        },
        update: {
          headline: headline || null,
          bio: bio || null,
          university: university || null,
          major: major || null,
          graduationYear,
          location: location || null,
          contactEmail: contactEmail || null,
          websiteUrl: websiteUrl || null,
        },
      }),
    ])
  } catch (error) {
    console.error('updateProfile failed', error)
    return { message: 'Something went wrong while saving your profile. Please try again.' }
  }

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard')
  return { success: true, message: 'Profile saved.' }
}

export type InlineEditKey = 'name' | 'headline' | 'bio'

const inlineEditSchemas: Record<InlineEditKey, z.ZodType<string>> = {
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(80, 'Name is too long.'),
  headline: z.string().trim().max(120, 'Headline is too long.'),
  bio: z.string().trim().max(2000, 'Bio is too long.'),
}

/** Single-field save for inline editing on the editor canvas. */
export async function updateProfileField(
  field: InlineEditKey,
  value: string
): Promise<{ ok: boolean; message?: string }> {
  const user = await requireUser()
  const schema = inlineEditSchemas[field]
  if (!schema) return { ok: false, message: 'Unknown field.' }
  const parsed = schema.safeParse(value)
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid value.' }
  }
  const next = parsed.data === '' ? null : parsed.data

  try {
    if (field === 'name') {
      await db.user.update({ where: { id: user.id }, data: { name: next } })
    } else {
      await db.profile.update({ where: { userId: user.id }, data: { [field]: next } })
    }
  } catch (error) {
    console.error(`updateProfileField(${field}) failed`, error)
    return { ok: false, message: 'Something went wrong. Please try again.' }
  }

  revalidatePath('/dashboard/editor')
  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard/preview')
  revalidatePath('/dashboard')
  if (user.username) revalidatePath(`/${user.username}`)
  return { ok: true }
}
