'use client'

import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/**
 * The browser origin (protocol + host) the app is served from. Returns an
 * empty string during server rendering and the first client render to avoid
 * hydration mismatches; it fills in after hydration.
 */
export function useAppOrigin(): string {
  return useSyncExternalStore(
    emptySubscribe,
    () => window.location.origin,
    () => ''
  )
}
