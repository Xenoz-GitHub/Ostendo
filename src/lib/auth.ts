import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { decryptSession, SESSION_COOKIE } from '@/lib/session'
import { db } from '@/lib/db'

export const getSessionUser = cache(async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const payload = await decryptSession(token)
  if (!payload) return null

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      username: true,
      emailVerifiedAt: true,
      profile: {
        select: { headline: true, contactEmail: true },
      },
      portfolio: {
        select: { template: true, published: true, publishedAt: true },
      },
    },
  })
  return user
})

export const requireUser = cache(async () => {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  return user
})

export const requireOnboarding = cache(async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { username: true },
  })
  if (!user) redirect('/login')
  if (!user.username) redirect('/onboarding')
})
