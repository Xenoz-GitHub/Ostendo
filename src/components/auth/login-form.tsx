'use client'

import Link from 'next/link'
import { useActionState, useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { login } from '@/actions/auth'
import { Alert, FieldError, Input, Label, SubmitButton } from '@/components/ui'
import { useToast } from '@/components/ui/toast'

export function LoginForm() {
  const [state, action] = useActionState(login, undefined)
  const [showPassword, setShowPassword] = useState(false)
  const toast = useToast()

  // Show rate limit warning as toast
  useEffect(() => {
    if (state?.message?.includes('Too many')) {
      toast.error('Rate limit exceeded', state.message)
    }
  }, [state?.message, toast])

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
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            invalid={Boolean(state?.errors?.password)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        </div>
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
