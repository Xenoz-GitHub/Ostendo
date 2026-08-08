import type { Metadata } from 'next'
import Link from 'next/link'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Reset password — Ostendo',
}

export default async function ResetPasswordPage(props: PageProps<'/reset-password'>) {
  const { token } = await props.searchParams
  const validToken = typeof token === 'string' && token.length > 20

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Choose a new password</h1>
      <p className="mt-1 mb-8 text-muted-foreground">
        Your new password must be at least 8 characters.
      </p>
      {validToken ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="text-sm text-muted-foreground">
          This link looks incomplete.{' '}
          <Link href="/forgot-password" className="font-medium text-primary hover:underline">
            Request a new one
          </Link>
          .
        </p>
      )}
    </div>
  )
}
