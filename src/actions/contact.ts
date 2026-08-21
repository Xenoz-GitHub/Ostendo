'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { appBaseUrl } from '@/lib/site'
import { checkContactFormRateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/request'

const contactMessageSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(80, 'Name is too long.'),
  email: z.string().trim().email('That email address looks invalid.').max(200),
  message: z
    .string()
    .trim()
    .min(3, 'Message must be at least 3 characters.')
    .max(5000, 'Message is too long.'),
})

export type ContactFormState = { ok?: boolean; error?: string }

export async function submitContactMessage(
  portfolioOwnerId: string,
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Honeypot field for bot detection
  const honeypot = formData.get('company')
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    // Silent success to not reveal the honeypot
    return { ok: true }
  }

  // Rate limiting by IP
  const ip = await getClientIp()
  const rateLimit = await checkContactFormRateLimit(ip)
  if (!rateLimit.success) {
    return {
      error: 'You are sending messages too quickly. Please wait a moment and try again.',
    }
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

  const { name, email, message } = parsed.data
  try {
    await db.contactMessage.create({
      data: { userId: portfolioOwnerId, visitorName: name, visitorEmail: email, message },
    })
  } catch (error) {
    console.error('submitContactMessage failed', error)
    return { error: 'Something went wrong. Please try again.' }
  }

  // Send email notification if contact email is configured
  if (owner.profile?.contactEmail) {
    const appUrl = await appBaseUrl()
    await sendEmail(
      {
        to: owner.profile.contactEmail,
        subject: `New message from ${name}`,
        text: `${name} (${email}) sent you a message from your portfolio:\n\n${message}\n\nView it in your dashboard: ${appUrl}/dashboard/messages`,
      },
      owner.id
    )
  }

  return { ok: true }
}
