'use client'

import { useMemo } from 'react'
import { Check, X } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
  showRequirements?: boolean
}

interface StrengthResult {
  score: number // 0-4
  label: string
  color: string
  checks: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
  }
}

function calculateStrength(password: string): StrengthResult {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  // Calculate score based on checks passed
  let score = 0
  if (checks.length) score++
  if (checks.uppercase && checks.lowercase) score++
  if (checks.number) score++
  if (checks.special) score++

  let label = 'Weak'
  let color = 'bg-destructive'

  if (score >= 4) {
    label = 'Strong'
    color = 'bg-success'
  } else if (score >= 3) {
    label = 'Good'
    color = 'bg-warning'
  } else if (score >= 2) {
    label = 'Fair'
    color = 'bg-warning/60'
  }

  return { score, label, color, checks }
}

export function PasswordStrength({ password, showRequirements = true }: PasswordStrengthProps) {
  const strength = useMemo(() => calculateStrength(password), [password])

  if (!password) {
    return null
  }

  return (
    <div className="mt-3 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-surface-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${(strength.score / 4) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground min-w-12">
          {strength.label}
        </span>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <div className="space-y-1 text-xs">
          <RequirementCheck
            met={strength.checks.length}
            label="At least 8 characters"
          />
          <RequirementCheck
            met={strength.checks.uppercase && strength.checks.lowercase}
            label="Uppercase and lowercase letters"
          />
          <RequirementCheck
            met={strength.checks.number}
            label="At least one number"
          />
          <RequirementCheck
            met={strength.checks.special}
            label="At least one special character"
          />
        </div>
      )}
    </div>
  )
}

function RequirementCheck({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {met ? (
        <Check className="size-3 text-success shrink-0" aria-hidden />
      ) : (
        <X className="size-3 text-muted-foreground/40 shrink-0" aria-hidden />
      )}
      <span className={met ? 'text-success' : 'text-muted-foreground'}>
        {label}
      </span>
    </div>
  )
}
