'use client'

import { useActionState, useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { resetPassword } from '@/actions/auth'
import { Alert, FieldError, Input, Label, SubmitButton } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { PasswordStrength } from '@/components/ui/password-strength'

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, undefined)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const toast = useToast()

  // Show success as toast
  useEffect(() => {
    if (state?.success) {
      toast.success('Password updated', 'You can now sign in with your new password.')
    }
  }, [state?.success, toast])

  if (state?.success) {
    return <Alert tone="success" title="Password updated">You can now sign in with your new password.</Alert>
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="token" value={token} />
      {state?.message && <Alert tone="error">{state.message}</Alert>}
      <div>
        <Label htmlFor="password">New password</Label>
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
      <SubmitButton className="w-full" pendingLabel="Updating password…">
        Update password
      </SubmitButton>
    </form>
  )
}
