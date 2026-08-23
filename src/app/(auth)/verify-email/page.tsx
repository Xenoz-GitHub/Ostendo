import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, XCircle, Mail } from 'lucide-react'
import { verifyEmail } from '@/actions/auth'
import { getSessionUser } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Verify email',
}

export default async function VerifyEmailPage(props: PageProps<'/verify-email'>) {
  const { token } = await props.searchParams
  let ok = false
  let message = 'This verification link is invalid or has expired.'
  let showResend = false

  if (typeof token === 'string' && token.length > 20) {
    const result = await verifyEmail(token)
    ok = result.ok
    message = result.message
    // Show resend option if token expired
    showResend = !ok && message.toLowerCase().includes('expired')
  } else {
    // Invalid or missing token
    showResend = true
    message = 'This verification link is invalid or incomplete.'
  }

  const user = await getSessionUser()

  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-surface-muted">
        {ok ? (
          <CheckCircle2 className="size-7 text-success" aria-hidden />
        ) : (
          <XCircle className="size-7 text-destructive" aria-hidden />
        )}
      </div>
      <h1 className="text-2xl font-bold tracking-tight">
        {ok ? 'Email verified' : 'Verification failed'}
      </h1>
      <p className="mt-2 text-muted-foreground">{message}</p>
      
      <div className="mt-6 flex flex-col gap-3 items-center">
        <Link
          href={user ? '/dashboard' : '/login'}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
        >
          {user ? 'Go to dashboard' : 'Sign in'}
        </Link>
        
        {!ok && showResend && (
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Mail className="size-4" aria-hidden />
            Request new verification link
          </Link>
        )}
      </div>
    </div>
  )
}
