'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { skillSchema } from '@/lib/validation'
import type { FormState } from '@/actions/profile'

export async function createSkill(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser()
  const parsed = skillSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const existing = await db.skill.findFirst({
    where: { userId: user.id, name: parsed.data.name },
    select: { id: true },
  })
  if (existing) return { errors: { name: ['You already have this skill.'] } }

  const count = await db.skill.count({ where: { userId: user.id } })

  try {
    await db.skill.create({
      data: { userId: user.id, name: parsed.data.name, orderIndex: count },
    })
  } catch (error) {
    console.error('createSkill failed', error)
    return { message: 'Something went wrong while saving your skill. Please try again.' }
  }

  revalidatePath('/dashboard/portfolio/skills')
  revalidatePath('/dashboard')
  return { success: true, message: 'Skill added.' }
}

export async function deleteSkill(id: string): Promise<void> {
  const user = await requireUser()
  await db.skill.deleteMany({ where: { id, userId: user.id } })
  revalidatePath('/dashboard/portfolio/skills')
  revalidatePath('/dashboard')
}

export async function reorderSkills(ids: string[]): Promise<{ ok: boolean; message?: string }> {
  const user = await requireUser()
  
  // Prevent DoS with excessive array sizes
  if (ids.length > 100) {
    return { ok: false, message: 'Cannot reorder more than 100 items at once.' }
  }
  
  const rows = await db.skill.findMany({
    where: { id: { in: ids }, userId: user.id },
    select: { id: true },
  })
  const owned = new Set(rows.map((r) => r.id))
  const ordered = ids.filter((id) => owned.has(id))
  await db.$transaction(
    ordered.map((id, index) =>
      db.skill.updateMany({ where: { id, userId: user.id }, data: { orderIndex: index } })
    )
  )
  revalidatePath('/dashboard/portfolio/skills')
  return { ok: true }
}
