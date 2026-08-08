'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { appBaseUrl } from '@/lib/site'

const contactMessageSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(80, 'Name is too long.'),
  email: z.string().trim().email('That email address looks invalid.').max(200),
  message: z.string().trim().min(3, 'Message must be at least 3 characters.').max(5000, 'Message is too long.'),
})

export type ContactFormState = { ok?: boolean; error?: string }

/** Crude in-memory rate limit so one visitor can't flood a portfolio. */
const RATE_LIMIT_MS = 60_000
const recentSubmissions = new Map<string, number>()

async function clientIp(): Promise<string> {
  const headerList = await headers()
  const forwarded = headerList.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return headerList.get('x-real-ip') ?? 'unknown'
}

export async function submitContactMessage(
  portfolioOwnerId: string,
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const honeypot = formData.get('company')
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    return { ok: true }
  }

  const ip = await clientIp()
  const now = Date.now()
  const last = recentSubmissions.get(ip)
  if (last && now - last < RATE_LIMIT_MS) {
    return { error: 'Please wait a moment before sending another message.' }
  }

  const parsed = contactMessageSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  })
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message
    return { error: first ?? 'Please fill in the form correctly.' }
  }

  const owner = await db.user.findUnique({
    where: { id: portfolioOwnerId },
    select: { id: true, profile: { select: { contactEmail: true } } },
  })
  if (!owner) return { error: 'Something went wrong. Please try again.' }

  recentSubmissions.set(ip, now)

  const { name, email, message } = parsed.data
  try {
    await db.contactMessage.create({
      data: { userId: portfolioOwnerId, visitorName: name, visitorEmail: email, message },
    })
  } catch (error) {
    console.error('submitContactMessage failed', error)
    return { error: 'Something went wrong. Please try again.' }
  }

  if (owner.profile?.contactEmail) {
    const appUrl = await appBaseUrl()
    await sendEmail(
      {
        to: owner.profile.contactEmail,
        subject: `New message from ${name} (${email})`,
        text: `${name} (${email}) sent you a message from your portfolio:\n\n${message}\n\nView it in your dashboard: ${appUrl}/dashboard/messages`,
      },
      owner.id
    )
  }

  return { ok: true }
}
