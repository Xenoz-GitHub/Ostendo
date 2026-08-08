'use client'

import { useState } from 'react'
import { MonitorSmartphone, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PreviewShell({
  children,
  initialView = 'desktop',
}: {
  children: React.ReactNode
  initialView?: 'mobile' | 'desktop'
}) {
  const [view, setView] = useState<'mobile' | 'desktop'>(initialView)

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Preview device"
        className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface p-1"
      >
        <PreviewTab active={view === 'desktop'} onClick={() => setView('desktop')} label="Desktop" icon={<Monitor className="size-4" aria-hidden />} />
        <PreviewTab active={view === 'mobile'} onClick={() => setView('mobile')} label="Phone" icon={<MonitorSmartphone className="size-4" aria-hidden />} />
      </div>

      <div
        className={cn(
          'overflow-hidden rounded-xl border border-border bg-background shadow-sm',
          view === 'mobile' && 'mx-auto w-[390px] max-w-full'
        )}
      >
        {children}
      </div>

      {view === 'mobile' && (
        <p className="text-center text-xs text-muted-foreground">
          This is how your portfolio looks on a phone. Swipe to scroll inside the preview.
        </p>
      )}
    </div>
  )
}

function PreviewTab({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors',
        active ? 'bg-surface-strong text-foreground' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  )
}
