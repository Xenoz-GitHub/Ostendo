'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'
import { getSessionUser } from '@/lib/auth'
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from '@/lib/validation'
import {
  generateToken,
  hashToken,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from '@/lib/email'

export type AuthFormState = {
  errors?: Record<string, string[] | undefined>
  message?: string
  success?: boolean
} | undefined

export async function signup(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }
  const { name, email, password } = parsed.data

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) {
    return {
      errors: { email: ['An account with this email already exists. Try signing in instead.'] },
    }
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        profile: { create: {} },
        portfolio: { create: {} },
      },
      select: { id: true },
    })

    const token = generateToken()
    await db.emailVerification.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })
    await sendVerificationEmail({ id: user.id, email }, token)

    await createSession(user.id)
  } catch (error) {
    console.error('signup failed', error)
    return { message: 'Something went wrong while creating your account. Please try again.' }
  }

  redirect('/onboarding')
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }
  const { email, password } = parsed.data

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, username: true },
  })
  if (!user) {
    return { message: 'Incorrect email or password.' }
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return { message: 'Incorrect email or password.' }
  }

  await createSession(user.id)
  redirect(user.username ? '/dashboard' : '/onboarding')
}

export async function logout(): Promise<void> {
  await deleteSession()
  redirect('/login')
}

export async function forgotPassword(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true },
  })

  if (user) {
    const token = generateToken()
    await db.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    })
    await sendPasswordResetEmail(user, token)
  }

  return {
    success: true,
    message: 'If that email has an account, a reset link is on its way.',
  }
}

export async function resetPassword(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const token = String(formData.get('token') ?? '')
  const parsed = resetPasswordSchema.safeParse({ password: formData.get('password') })
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const record = await db.passwordReset.findFirst({
    where: { tokenHash: hashToken(token), usedAt: null },
    select: { id: true, userId: true, expiresAt: true },
  })
  if (!record || record.expiresAt < new Date()) {
    return { message: 'This reset link is invalid or has expired. Request a new one.' }
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 10)
    await db.$transaction([
      db.passwordReset.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      db.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    ])
  } catch (error) {
    console.error('resetPassword failed', error)
    return { message: 'Something went wrong. Please try again.' }
  }

  return { success: true, message: 'Password updated. You can now sign in.' }
}

export async function verifyEmail(token: string): Promise<{ ok: boolean; message: string }> {
  const record = await db.emailVerification.findFirst({
    where: { tokenHash: hashToken(token), usedAt: null },
    select: { id: true, userId: true, expiresAt: true },
  })
  if (!record || record.expiresAt < new Date()) {
    return { ok: false, message: 'This verification link is invalid or has expired.' }
  }

  await db.$transaction([
    db.emailVerification.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    db.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
  ])
  return { ok: true, message: 'Your email address has been verified.' }
}

export async function resendVerificationEmail(): Promise<AuthFormState> {
  const user = await getSessionUser()
  if (!user) return { message: 'You need to be signed in.' }

  try {
    const token = generateToken()
    await db.emailVerification.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })
    await sendVerificationEmail({ id: user.id, email: user.email }, token)
    return { success: true, message: 'Verification email sent. Check your inbox.' }
  } catch (error) {
    console.error('resend verification failed', error)
    return { message: 'Something went wrong sending the email. Please try again.' }
  }
}
