'use server'

import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { accountEmailSchema, changePasswordSchema } from '@/lib/validation'
import { deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { AuthFormState } from '@/actions/auth'

export async function updateEmail(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const user = await requireUser()
  const parsed = accountEmailSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  })
  if (existing && existing.id !== user.id) {
    return { errors: { email: ['This email is already in use.'] } }
  }

  try {
    await db.user.update({
      where: { id: user.id },
      data: { email: parsed.data.email, emailVerifiedAt: null },
    })
  } catch (error) {
    console.error('updateEmail failed', error)
    return { message: 'Something went wrong while saving your email. Please try again.' }
  }

  revalidatePath('/dashboard/account')
  return { success: true, message: 'Email updated.' }
}

export async function changePassword(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const user = await requireUser()
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
  })
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const record = await db.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  })
  if (!record) return { message: 'Something went wrong. Please try again.' }

  const valid = await bcrypt.compare(parsed.data.currentPassword, record.passwordHash)
  if (!valid) {
    return { errors: { currentPassword: ['Your current password is incorrect.'] } }
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10)
    await db.user.update({ where: { id: user.id }, data: { passwordHash } })
  } catch (error) {
    console.error('changePassword failed', error)
    return { message: 'Something went wrong while changing your password. Please try again.' }
  }

  return { success: true, message: 'Password changed.' }
}

export async function deleteAccount(): Promise<void> {
  const user = await requireUser()
  try {
    await db.user.delete({ where: { id: user.id } })
  } catch (error) {
    console.error('deleteAccount failed', error)
    return
  }
  await deleteSession()
  redirect('/')
}
