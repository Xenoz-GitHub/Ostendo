'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { sendPortfolioPublishedEmail } from '@/lib/email'

const TEMPLATE_IDS = ['MINIMAL', 'DEVELOPER', 'CREATIVE', 'EDITORIAL'] as const

export async function setTemplate(template: string): Promise<{ ok: boolean; message?: string }> {
  const user = await requireUser()
  if (!TEMPLATE_IDS.includes(template as (typeof TEMPLATE_IDS)[number])) {
    return { ok: false, message: 'Unknown template.' }
  }
  try {
    await db.portfolio.update({
      where: { userId: user.id },
      data: { template: template as (typeof TEMPLATE_IDS)[number] },
    })
  } catch (error) {
    console.error('setTemplate failed', error)
    return { ok: false, message: 'Something went wrong. Please try again.' }
  }
  revalidatePath('/dashboard/template')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function publishPortfolio(): Promise<{ ok: boolean; message?: string }> {
  const user = await requireUser()
  if (!user.username) return { ok: false, message: 'Choose a username before publishing.' }

  try {
    await db.portfolio.update({
      where: { userId: user.id },
      data: { published: true, publishedAt: new Date() },
    })
    if (user.emailVerifiedAt) {
      await sendPortfolioPublishedEmail({ id: user.id, email: user.email, username: user.username })
    }
  } catch (error) {
    console.error('publishPortfolio failed', error)
    return { ok: false, message: 'Something went wrong while publishing. Please try again.' }
  }
  revalidatePath('/dashboard/template')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function unpublishPortfolio(): Promise<{ ok: boolean; message?: string }> {
  const user = await requireUser()
  try {
    await db.portfolio.update({
      where: { userId: user.id },
      data: { published: false, publishedAt: null },
    })
  } catch (error) {
    console.error('unpublishPortfolio failed', error)
    return { ok: false, message: 'Something went wrong. Please try again.' }
  }
  revalidatePath('/dashboard/template')
  revalidatePath('/dashboard')
  return { ok: true }
}
