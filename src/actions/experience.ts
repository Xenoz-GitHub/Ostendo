'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { experienceSchema } from '@/lib/validation'
import type { FormState } from '@/actions/profile'

async function parseExperience(formData: FormData) {
  const raw = {
    organization: formData.get('organization'),
    position: formData.get('position'),
    description: formData.get('description'),
    startMonth: formData.get('startMonth'),
    startYear: formData.get('startYear'),
    endMonth: formData.get('endMonth'),
    endYear: formData.get('endYear'),
    current: formData.get('current') === 'on',
  }
  return experienceSchema.safeParse(raw)
}

export async function createExperience(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser()
  const parsed = await parseExperience(formData)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const count = await db.experience.count({ where: { userId: user.id } })

  try {
    await db.experience.create({
      data: {
        userId: user.id,
        organization: parsed.data.organization,
        position: parsed.data.position,
        description: parsed.data.description || null,
        startMonth: parsed.data.startMonth || null,
        startYear: parsed.data.startYear,
        endMonth: parsed.data.endMonth || null,
        endYear: parsed.data.endYear,
        current: parsed.data.current ?? false,
        orderIndex: count,
      },
    })
  } catch (error) {
    console.error('createExperience failed', error)
    return { message: 'Something went wrong while saving. Please try again.' }
  }

  revalidatePath('/dashboard/portfolio/experience')
  redirect('/dashboard/portfolio/experience')
}

export async function updateExperience(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser()
  const id = String(formData.get('id') ?? '')
  const parsed = await parseExperience(formData)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const result = await db.experience.updateMany({
    where: { id, userId: user.id },
    data: {
      organization: parsed.data.organization,
      position: parsed.data.position,
      description: parsed.data.description || null,
      startMonth: parsed.data.startMonth || null,
      startYear: parsed.data.startYear,
      endMonth: parsed.data.endMonth || null,
      endYear: parsed.data.endYear,
      current: parsed.data.current ?? false,
    },
  })
  if (result.count === 0) return { message: 'Entry not found.' }

  revalidatePath('/dashboard/portfolio/experience')
  redirect('/dashboard/portfolio/experience')
}

export async function deleteExperience(id: string): Promise<void> {
  const user = await requireUser()
  await db.experience.deleteMany({ where: { id, userId: user.id } })
  revalidatePath('/dashboard/portfolio/experience')
}

export async function reorderExperience(ids: string[]): Promise<void> {
  const user = await requireUser()
  
  // Prevent DoS with excessive array sizes
  if (ids.length > 100) {
    throw new Error('Too many items to reorder')
  }
  
  const rows = await db.experience.findMany({
    where: { id: { in: ids }, userId: user.id },
    select: { id: true },
  })
  const owned = new Set(rows.map((r) => r.id))
  const ordered = ids.filter((id) => owned.has(id))
  await db.$transaction(
    ordered.map((id, index) =>
      db.experience.updateMany({ where: { id, userId: user.id }, data: { orderIndex: index } })
    )
  )
  revalidatePath('/dashboard/portfolio/experience')
}
