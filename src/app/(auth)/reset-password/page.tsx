import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Reset password',
}

export default async function ResetPasswordPage(props: PageProps<'/reset-password'>) {
  const { token } = await props.searchParams
  const validToken = typeof token === 'string' && token.length > 20

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Choose a new password</h1>
      <p className="mt-1 mb-8 text-muted-foreground">
        Your new password must be at least 8 characters long.
      </p>
      {validToken ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="rounded-lg border border-warning/20 bg-warning/5 p-6 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-warning/10">
            <AlertTriangle className="size-6 text-warning" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold mb-2">Invalid reset link</h2>
          <p className="text-sm text-muted-foreground mb-4">
            This password reset link is incomplete or invalid. Please request a new one.
          </p>
          <Link 
            href="/forgot-password" 
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            Request new reset link
          </Link>
        </div>
      )}
    </div>
  )
}
