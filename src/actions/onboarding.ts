'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { usernameSchema } from '@/lib/validation'
import { isUsernameAvailable } from '@/lib/portfolio'

export type OnboardingState = {
  errors?: Record<string, string[] | undefined>
  message?: string
} | undefined

export async function claimUsername(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const user = await requireUser()
  const parsed = usernameSchema.safeParse(formData.get('username'))
  if (!parsed.success) {
    return { errors: { username: parsed.error.flatten().formErrors ?? ['Invalid username.'] } }
  }

  if (user.username) {
    const available = await isUsernameAvailable(parsed.data)
    if (parsed.data !== user.username && !available) {
      return { errors: { username: ['This username is already taken.'] } }
    }
  } else {
    const available = await isUsernameAvailable(parsed.data)
    if (!available) {
      return { errors: { username: ['This username is already taken.'] } }
    }
  }

  try {
    await db.user.update({ where: { id: user.id }, data: { username: parsed.data } })
  } catch (error) {
    console.error('claimUsername failed', error)
    return { message: 'Something went wrong while saving your username. Please try again.' }
  }

  revalidatePath('/dashboard')
  const returnTo = formData.get('returnTo')
  redirect(returnTo === 'account' ? '/dashboard/account' : '/onboarding?step=profile')
}
