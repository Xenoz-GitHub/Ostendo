'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFormStatus } from 'react-dom'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'bg-surface-strong text-foreground hover:bg-border-strong',
  outline: 'border border-border-strong bg-surface text-foreground hover:bg-surface-muted',
  ghost: 'text-foreground hover:bg-surface-muted',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive-hover',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'size-11',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}) {
  return (
    <button
      className={cn(
        'inline-flex select-none items-center justify-center rounded-lg font-medium transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        loading && 'relative',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="size-4 animate-spin" aria-hidden />
        </span>
      )}
      <span className={cn(loading && 'invisible')}>{children}</span>
    </button>
  )
}

export function SubmitButton({
  children,
  pendingLabel = 'Please wait…',
  className,
  variant = 'primary',
  size = 'md',
}: {
  children: React.ReactNode
  pendingLabel?: string
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
}) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant={variant} size={size} loading={pending} className={className}>
      {pending ? pendingLabel : children}
    </Button>
  )
}
