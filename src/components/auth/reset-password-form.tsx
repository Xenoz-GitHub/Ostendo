'use client'

import { useActionState } from 'react'
import { resetPassword } from '@/actions/auth'
import { Alert, FieldError, Input, Label, SubmitButton } from '@/components/ui'

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, undefined)

  if (state?.success) {
    return <Alert tone="success" title="Password updated">You can now sign in with your new password.</Alert>
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="token" value={token} />
      {state?.message && <Alert tone="error">{state.message}</Alert>}
      <div>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          invalid={Boolean(state?.errors?.password)}
        />
        <FieldError>{state?.errors?.password?.[0]}</FieldError>
      </div>
      <SubmitButton className="w-full" pendingLabel="Updating password…">
        Update password
      </SubmitButton>
    </form>
  )
}
