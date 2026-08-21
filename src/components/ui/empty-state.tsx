import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

/**
 * Empty state component for when there's no data to display.
 * Provides helpful guidance and a clear call-to-action.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface/50 p-12 text-center',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && (
        <>
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {action.label}
            </button>
          )}
        </>
      )}
    </div>
  )
}

/**
 * Compact empty state for smaller spaces like sidebars or cards.
 */
export function CompactEmptyState({
  icon: Icon,
  message,
  action,
}: {
  icon?: LucideIcon
  message: string
  action?: EmptyStateProps['action']
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {Icon && (
        <Icon className="mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
      )}
      <p className="mb-4 text-sm text-muted-foreground">{message}</p>
      {action && (
        <>
          {action.href ? (
            <Link
              href={action.href}
              className="text-sm font-medium text-primary hover:underline"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="text-sm font-medium text-primary hover:underline"
            >
              {action.label}
            </button>
          )}
        </>
      )}
    </div>
  )
}

/**
 * Search empty state for when search returns no results.
 */
export function SearchEmptyState({
  query,
  onClear,
}: {
  query: string
  onClear?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <svg
          className="h-6 w-6 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold">No results found</h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">
        We couldn't find anything matching{' '}
        <span className="font-medium text-foreground">"{query}"</span>. Try a
        different search term.
      </p>
      {onClear && (
        <button
          onClick={onClear}
          className="text-sm font-medium text-primary hover:underline"
        >
          Clear search
        </button>
      )}
    </div>
  )
}

/**
 * Error empty state for when something goes wrong loading data.
 */
export function ErrorEmptyState({
  title = 'Something went wrong',
  description = 'We encountered an error loading this content.',
  retry,
}: {
  title?: string
  description?: string
  retry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <svg
          className="h-6 w-6 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      {retry && (
        <button
          onClick={retry}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      )}
    </div>
  )
}
