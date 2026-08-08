'use client'

import { useActionState } from 'react'
import { forgotPassword } from '@/actions/auth'
import { Alert, FieldError, Input, Label, SubmitButton } from '@/components/ui'

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPassword, undefined)

  if (state?.success) {
    return <Alert tone="success" title="Check your inbox">{state.message}</Alert>
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      {state?.message && <Alert tone="error">{state.message}</Alert>}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          invalid={Boolean(state?.errors?.email)}
        />
        <FieldError>{state?.errors?.email?.[0]}</FieldError>
      </div>
      <SubmitButton className="w-full" pendingLabel="Sending link…">
        Send reset link
      </SubmitButton>
    </form>
  )
}
