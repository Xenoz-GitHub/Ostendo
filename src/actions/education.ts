'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { educationSchema } from '@/lib/validation'
import type { FormState } from '@/actions/profile'

async function parseEducation(formData: FormData) {
  const raw = {
    institution: formData.get('institution'),
    degree: formData.get('degree'),
    field: formData.get('field'),
    startYear: formData.get('startYear'),
    endYear: formData.get('endYear'),
    description: formData.get('description'),
  }
  return educationSchema.safeParse(raw)
}

export async function createEducation(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser()
  const parsed = await parseEducation(formData)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const count = await db.education.count({ where: { userId: user.id } })

  try {
    await db.education.create({
      data: {
        userId: user.id,
        institution: parsed.data.institution,
        degree: parsed.data.degree || null,
        field: parsed.data.field || null,
        startYear: parsed.data.startYear,
        endYear: parsed.data.endYear,
        description: parsed.data.description || null,
        orderIndex: count,
      },
    })
  } catch (error) {
    console.error('createEducation failed', error)
    return { message: 'Something went wrong while saving. Please try again.' }
  }

  revalidatePath('/dashboard/portfolio/education')
  redirect('/dashboard/portfolio/education')
}

export async function updateEducation(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser()
  const id = String(formData.get('id') ?? '')
  const parsed = await parseEducation(formData)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const result = await db.education.updateMany({
    where: { id, userId: user.id },
    data: {
      institution: parsed.data.institution,
      degree: parsed.data.degree || null,
      field: parsed.data.field || null,
      startYear: parsed.data.startYear,
      endYear: parsed.data.endYear,
      description: parsed.data.description || null,
    },
  })
  if (result.count === 0) return { message: 'Entry not found.' }

  revalidatePath('/dashboard/portfolio/education')
  redirect('/dashboard/portfolio/education')
}

export async function deleteEducation(id: string): Promise<void> {
  const user = await requireUser()
  await db.education.deleteMany({ where: { id, userId: user.id } })
  revalidatePath('/dashboard/portfolio/education')
}

export async function reorderEducation(ids: string[]): Promise<void> {
  const user = await requireUser()
  const rows = await db.education.findMany({
    where: { id: { in: ids }, userId: user.id },
    select: { id: true },
  })
  const owned = new Set(rows.map((r) => r.id))
  const ordered = ids.filter((id) => owned.has(id))
  await db.$transaction(
    ordered.map((id, index) =>
      db.education.updateMany({ where: { id, userId: user.id }, data: { orderIndex: index } })
    )
  )
  revalidatePath('/dashboard/portfolio/education')
}
