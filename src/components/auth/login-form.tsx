'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { login } from '@/actions/auth'
import { Alert, FieldError, Input, Label, SubmitButton } from '@/components/ui'

export function LoginForm() {
  const [state, action] = useActionState(login, undefined)

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
          placeholder="you@university.edu"
          invalid={Boolean(state?.errors?.email)}
        />
        <FieldError>{state?.errors?.email?.[0]}</FieldError>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="mb-1.5 text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          invalid={Boolean(state?.errors?.password)}
        />
        <FieldError>{state?.errors?.password?.[0]}</FieldError>
      </div>

      <SubmitButton className="w-full" pendingLabel="Signing in…">
        Sign in
      </SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        New to Ostendo?{' '}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  )
}
