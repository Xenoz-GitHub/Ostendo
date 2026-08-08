import Link from 'next/link'
import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-start justify-between gap-3', className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function LinkButton({
  href,
  children,
  variant = 'primary',
  className,
  target,
}: {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  className?: string
  target?: string
}) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
    secondary: 'bg-surface-strong text-foreground hover:bg-border-strong',
    outline: 'border border-border-strong bg-surface text-foreground hover:bg-surface-muted',
  }
  return (
    <Link
      href={href}
      target={target}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors',
        variants[variant],
        className
      )}
    >
      {children}
    </Link>
  )
}
