import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, XCircle } from 'lucide-react'
import { verifyEmail } from '@/actions/auth'
import { getSessionUser } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Verify email — Ostendo',
}

export default async function VerifyEmailPage(props: PageProps<'/verify-email'>) {
  const { token } = await props.searchParams
  let ok = false
  let message = 'This verification link is invalid or has expired.'

  if (typeof token === 'string' && token.length > 20) {
    const result = await verifyEmail(token)
    ok = result.ok
    message = result.message
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
        {ok ? 'Email verified' : 'Link invalid'}
      </h1>
      <p className="mt-2 text-muted-foreground">{message}</p>
      <Link
        href={user ? '/dashboard' : '/login'}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
      >
        {user ? 'Go to dashboard' : 'Sign in'}
      </Link>
    </div>
  )
}
