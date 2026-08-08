import 'server-only'
import { createHash, randomBytes } from 'crypto'
import { db } from '@/lib/db'
import { appBaseUrl, portfolioUrl } from '@/lib/site'

export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export type EmailMessage = {
  to: string
  subject: string
  text: string
  html?: string
}

export type EmailProvider = {
  name: string
  send(message: EmailMessage): Promise<void>
}

/**
 * Dev provider: logs to the server console and records the message in the
 * database. No SMTP server required while developing.
 */
class ConsoleEmailProvider implements EmailProvider {
  name = 'console'

  async send(message: EmailMessage): Promise<void> {
    console.log(
      `\n[ostendo:email] To: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n`
    )
  }
}

/**
 * Provider boundary. Switch providers here without touching application code.
 * Production providers (e.g. transactional email APIs with free tiers) must
 * implement EmailProvider.
 */
function getProvider(): EmailProvider {
  const configured = process.env.EMAIL_PROVIDER ?? 'console'
  switch (configured) {
    case 'console':
      return new ConsoleEmailProvider()
    default:
      return new ConsoleEmailProvider()
  }
}

export async function sendEmail(
  message: EmailMessage,
  userId?: string
): Promise<void> {
  const provider = getProvider()
  try {
    await provider.send(message)
    await db.emailMessage.create({
      data: {
        userId: userId ?? null,
        to: message.to,
        subject: message.subject,
        provider: provider.name,
        status: 'sent',
      },
    })
  } catch (error) {
    await db.emailMessage.create({
      data: {
        userId: userId ?? null,
        to: message.to,
        subject: message.subject,
        provider: provider.name,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })
  }
}

async function verificationLink(token: string): Promise<string> {
  const base = await appBaseUrl()
  return `${base}/verify-email?token=${token}`
}

async function resetLink(token: string): Promise<string> {
  const base = await appBaseUrl()
  return `${base}/reset-password?token=${token}`
}

export async function sendVerificationEmail(
  user: { id: string; email: string },
  token: string
): Promise<void> {
  const link = verificationLink(token)
  await sendEmail(
    {
      to: user.email,
      subject: 'Verify your email address',
      text: `Welcome to Ostendo. Verify your email address to secure your account:\n\n${link}\n\nIf you did not create this account, you can ignore this email.`,
      html: undefined,
    },
    user.id
  )
}

export async function sendPasswordResetEmail(
  user: { id: string; email: string },
  token: string
): Promise<void> {
  const link = resetLink(token)
  await sendEmail(
    {
      to: user.email,
      subject: 'Reset your password',
      text: `We received a request to reset your Ostendo password. Use the link below to choose a new one:\n\n${link}\n\nThis link expires in 30 minutes. If you did not request this, you can ignore this email.`,
      html: undefined,
    },
    user.id
  )
}

export async function sendPortfolioPublishedEmail(
  user: { id: string; email: string; username: string }
): Promise<void> {
  const url = await portfolioUrl(user.username)
  await sendEmail(
    {
      to: user.email,
      subject: 'Your portfolio is live',
      text: `Your portfolio is now public:\n\n${url}\n\nShare this link with recruiters, friends, and classmates.`,
      html: undefined,
    },
    user.id
  )
}
