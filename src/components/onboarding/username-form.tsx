'use client'

import { useActionState, useState } from 'react'
import { claimUsername } from '@/actions/onboarding'
import { Alert, FieldError, Input, Label, SubmitButton } from '@/components/ui'
import { UsernameAvailability } from '@/components/onboarding/username-availability'
import { useAppOrigin } from '@/lib/use-origin'

export function UsernameForm({ current }: { current?: string | null }) {
  const [state, action] = useActionState(claimUsername, undefined)
  const [value, setValue] = useState(current ?? '')
  const origin = useAppOrigin()

  return (
    <form action={action} className="space-y-5" noValidate>
      {state?.message && <Alert tone="error">{state.message}</Alert>}
      <div>
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <Input
            id="username"
            name="username"
            className="font-mono"
            placeholder="crystal"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="none"
            invalid={Boolean(state?.errors?.username)}
          />
        </div>
        <p className="mt-1.5 font-mono text-xs text-muted-foreground">
          {origin ? (
            <>
              {origin}/<span className="text-foreground">{value}</span>
            </>
          ) : (
            <>/…/<span className="text-foreground">{value}</span></>
          )}
        </p>
        <FieldError>{state?.errors?.username?.[0]}</FieldError>
        <UsernameAvailability username={value} />
      </div>
      <SubmitButton className="w-full" pendingLabel="Reserving…">
        Reserve this URL
      </SubmitButton>
    </form>
  )
}
