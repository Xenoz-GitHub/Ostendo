'use client'

import { startTransition } from 'react'
import { ArrowDown, ArrowUp, Pencil, Star, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function IconButton({
  onClick,
  label,
  children,
  disabled,
  tone = 'neutral',
}: {
  onClick?: () => void
  label: string
  children: React.ReactNode
  disabled?: boolean
  tone?: 'neutral' | 'warning' | 'destructive'
}) {
  const tones = {
    neutral: 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
    warning: 'text-muted-foreground hover:bg-warning-muted hover:text-warning',
    destructive: 'text-muted-foreground hover:bg-destructive-muted hover:text-destructive',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={cn(
        'flex size-9 items-center justify-center rounded-lg transition-colors disabled:pointer-events-none disabled:opacity-30',
        tones[tone]
      )}
    >
      {children}
    </button>
  )
}

export function ItemActions({
  reorder,
  ids,
  index,
  editHref,
  onEdit,
  deleteAction,
  deleteLabel,
  extra,
}: {
  reorder: (ids: string[]) => void
  ids: string[]
  index: number
  editHref?: string
  onEdit?: () => void
  deleteAction: () => void
  deleteLabel: string
  extra?: React.ReactNode
}) {
  const canUp = index > 0
  const canDown = index < ids.length - 1

  function move(direction: -1 | 1) {
    if (!canUp && direction === -1) return
    if (!canDown && direction === 1) return
    const next = [...ids]
    const target = index + direction
    ;[next[index], next[target]] = [next[target], next[index]]
    startTransition(() => reorder(next))
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      {extra}
      <IconButton label="Move up" onClick={() => move(-1)} disabled={!canUp}>
        <ArrowUp className="size-4" aria-hidden />
      </IconButton>
      <IconButton label="Move down" onClick={() => move(1)} disabled={!canDown}>
        <ArrowDown className="size-4" aria-hidden />
      </IconButton>
      {editHref && (
        <Link href={editHref} aria-label="Edit" title="Edit" className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground">
          <Pencil className="size-4" aria-hidden />
        </Link>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit"
          title="Edit"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <Pencil className="size-4" aria-hidden />
        </button>
      )}
      <form
        action={deleteAction}
        onSubmit={(event) => {
          if (!window.confirm(deleteLabel)) event.preventDefault()
        }}
      >
        <IconButton label="Delete" tone="destructive">
          <Trash2 className="size-4" aria-hidden />
        </IconButton>
      </form>
    </div>
  )
}

export function FeaturedToggle({
  featured,
  onToggle,
  label,
}: {
  featured: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className={cn(
        'flex size-9 items-center justify-center rounded-lg transition-colors',
        featured
          ? 'bg-warning-muted text-warning hover:bg-warning-muted/70'
          : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'
      )}
    >
      <Star className={cn('size-4', featured && 'fill-current')} aria-hidden />
    </button>
  )
}
