import { cn } from '@/lib/utils'

export function Input({
  className,
  invalid,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-lg border border-border-strong bg-surface px-3.5 text-sm text-foreground',
        'placeholder:text-muted-foreground/60',
        'transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30',
        invalid && 'border-destructive focus:border-destructive focus:ring-destructive/30',
        className
      )}
      {...props}
    />
  )
}

export function Textarea({
  className,
  invalid,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-foreground',
        'placeholder:text-muted-foreground/60',
        'transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30',
        invalid && 'border-destructive focus:border-destructive focus:ring-destructive/30',
        className
      )}
      {...props}
    />
  )
}

export function Select({
  className,
  invalid,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      className={cn(
        'h-11 w-full appearance-none rounded-lg border border-border-strong bg-surface px-3.5 pr-8 text-sm text-foreground',
        'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236f6a64%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E")] bg-no-repeat bg-[right_0.75rem_center]',
        'transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30',
        invalid && 'border-destructive focus:border-destructive focus:ring-destructive/30',
        className
      )}
      {...props}
    />
  )
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('mb-1.5 block text-sm font-medium text-foreground', className)}
      {...props}
    />
  )
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null
  return (
    <p role="alert" className="mt-1.5 text-sm text-destructive">
      {children}
    </p>
  )
}

export function FieldHint({ children }: { children?: React.ReactNode }) {
  if (!children) return null
  return <p className="mt-1.5 text-xs text-muted-foreground">{children}</p>
}
