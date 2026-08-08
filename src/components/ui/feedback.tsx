import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Alert({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children?: React.ReactNode
  className?: string
}) {
  const styles = {
    info: 'border-border bg-surface text-foreground',
    success: 'border-success/30 bg-success-muted text-success',
    warning: 'border-warning/30 bg-warning-muted text-warning',
    error: 'border-destructive/30 bg-destructive-muted text-destructive',
  }
  const icons = {
    info: <Info className="size-5 shrink-0" aria-hidden />,
    success: <CheckCircle2 className="size-5 shrink-0" aria-hidden />,
    warning: <AlertTriangle className="size-5 shrink-0" aria-hidden />,
    error: <XCircle className="size-5 shrink-0" aria-hidden />,
  }
  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      className={cn('flex items-start gap-3 rounded-lg border p-4 text-sm', styles[tone], className)}
    >
      {icons[tone]}
      <div className="min-w-0">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="mt-0.5 opacity-90">{children}</div>}
      </div>
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface px-6 py-12 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-surface-muted text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-surface-strong', className)} aria-hidden />
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('size-5 animate-spin text-muted-foreground', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors',
        'disabled:opacity-50 disabled:pointer-events-none',
        checked ? 'border-primary bg-primary' : 'border-border-strong bg-surface-strong'
      )}
    >
      <span
        className={cn(
          'inline-block size-5 transform rounded-full bg-surface shadow-sm transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  )
}
