'use client'

import { useActionState } from 'react'
import { changePassword, deleteAccount, updateEmail } from '@/actions/account'
import { Alert, Button, FieldError, Input, Label, SubmitButton } from '@/components/ui'

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, action] = useActionState(updateEmail, undefined)

  return (
    <form action={action} className="space-y-4" noValidate>
      {state?.message && <Alert tone="error">{state.message}</Alert>}
      {state?.success && <Alert tone="success">{state.message}</Alert>}
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" defaultValue={currentEmail} invalid={Boolean(state?.errors?.email)} />
        <FieldError>{state?.errors?.email?.[0]}</FieldError>
      </div>
      <SubmitButton pendingLabel="Saving…">Save email</SubmitButton>
    </form>
  )
}

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, undefined)

  return (
    <form action={action} className="space-y-4" noValidate>
      {state?.message && <Alert tone="error">{state.message}</Alert>}
      {state?.success && <Alert tone="success">{state.message}</Alert>}
      <div>
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          invalid={Boolean(state?.errors?.currentPassword)}
        />
        <FieldError>{state?.errors?.currentPassword?.[0]}</FieldError>
      </div>
      <div>
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          invalid={Boolean(state?.errors?.newPassword)}
        />
        <FieldError>{state?.errors?.newPassword?.[0]}</FieldError>
      </div>
      <SubmitButton pendingLabel="Updating…">Change password</SubmitButton>
    </form>
  )
}

export function DeleteAccountForm() {
  return (
    <form
      action={deleteAccount}
      onSubmit={(event) => {
        if (
          !window.confirm(
            'Delete your account permanently? Your portfolio, projects, and username will be gone.'
          )
        ) {
          event.preventDefault()
        }
      }}
    >
      <Button type="submit" variant="destructive">
        Delete account
      </Button>
    </form>
  )
}
