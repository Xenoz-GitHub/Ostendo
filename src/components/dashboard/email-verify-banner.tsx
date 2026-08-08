'use client'

import { useActionState } from 'react'
import { resendVerificationEmail } from '@/actions/auth'
import { Alert, SubmitButton } from '@/components/ui'

export function EmailVerifyBanner() {
  const [state, action] = useActionState(resendVerificationEmail, undefined)

  if (state?.success) {
    return <Alert tone="success">{state.message}</Alert>
  }

  return (
    <Alert tone="warning" title="Verify your email address">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">Confirm your email to secure your account and unlock portfolio notifications.</p>
        <form action={action}>
          <SubmitButton variant="outline" size="sm" pendingLabel="Sending…">
            Resend email
          </SubmitButton>
        </form>
      </div>
    </Alert>
  )
}
