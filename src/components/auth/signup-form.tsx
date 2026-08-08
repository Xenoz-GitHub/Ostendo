'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signup } from '@/actions/auth'
import { Alert, FieldError, Input, Label, SubmitButton } from '@/components/ui'

export function SignupForm() {
  const [state, action] = useActionState(signup, undefined)

  return (
    <form action={action} className="space-y-5" noValidate>
      {state?.message && <Alert tone="error">{state.message}</Alert>}

      <div>
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Crystal Santos"
          invalid={Boolean(state?.errors?.name)}
        />
        <FieldError>{state?.errors?.name?.[0]}</FieldError>
      </div>

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
        <Label htmlFor="password">Password</Label>
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

      <SubmitButton className="w-full" pendingLabel="Creating account…">
        Create account
      </SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
