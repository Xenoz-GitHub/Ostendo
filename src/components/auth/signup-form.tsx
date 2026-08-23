'use client'

import Link from 'next/link'
import { useActionState, useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { signup } from '@/actions/auth'
import { Alert, FieldError, Input, Label, SubmitButton } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { PasswordStrength } from '@/components/ui/password-strength'

export function SignupForm() {
  const [state, action] = useActionState(signup, undefined)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
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
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="John Doe"
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
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            invalid={Boolean(state?.errors?.password)}
            className="pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        <PasswordStrength password={password} showRequirements={password.length > 0} />
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
