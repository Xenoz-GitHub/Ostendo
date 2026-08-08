'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

type CheckState = {
  status: 'idle' | 'available' | 'unavailable'
  message?: string
  checked: string
}

const INITIAL: CheckState = { status: 'idle', checked: '' }

export function UsernameAvailability({ username }: { username: string }) {
  const [state, setState] = useState<CheckState>(INITIAL)

  const value = username.trim().toLowerCase()
  const valid = value.length >= 3 && value.length <= 30 && /^[a-z0-9-]+$/.test(value)
  const checking = valid && state.checked !== value

  useEffect(() => {
    if (!valid) return
    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/username/check?username=${encodeURIComponent(value)}`, {
          signal: controller.signal,
        })
        const data = (await response.json()) as { available: boolean }
        setState(
          data.available
            ? { status: 'available', message: 'This username is available.', checked: value }
            : { status: 'unavailable', message: 'This username is already taken.', checked: value }
        )
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setState({ status: 'idle', checked: value })
      }
    }, 350)
    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [value, valid])

  if (!valid) return null

  if (checking) {
    return (
      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" aria-hidden /> Checking…
      </p>
    )
  }

  if (state.status === 'idle') return null

  return (
    <p
      className={`mt-1.5 flex items-center gap-1.5 text-sm ${
        state.status === 'available' ? 'text-success' : 'text-destructive'
      }`}
    >
      {state.status === 'available' ? (
        <>
          <CheckCircle2 className="size-3.5" aria-hidden /> {state.message}
        </>
      ) : (
        <>
          <XCircle className="size-3.5" aria-hidden /> {state.message}
        </>
      )}
    </p>
  )
}
