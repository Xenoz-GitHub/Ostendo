'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { InlineEditKey } from '@/actions/profile'

type EditableContextValue = {
  enabled: boolean
  onCommit: (field: InlineEditKey, value: string) => void
}

const EditableContext = createContext<EditableContextValue>({
  enabled: false,
  onCommit: () => {},
})

export function EditableProvider({
  enabled,
  onCommit,
  children,
}: {
  enabled: boolean
  onCommit: (field: InlineEditKey, value: string) => void
  children: React.ReactNode
}) {
  return (
    <EditableContext.Provider value={{ enabled, onCommit }}>{children}</EditableContext.Provider>
  )
}

/**
 * Text that can be edited in place when wrapped in an enabled EditableProvider
 * (the editor canvas). Outside of it, it renders as plain text.
 */
export function EditableText({
  field,
  text,
  as: Tag = 'span',
  multiline = false,
  className,
}: {
  field: InlineEditKey
  text: string | null
  as?: 'span' | 'p' | 'h1' | 'h2'
  multiline?: boolean
  className?: string
}) {
  const { enabled, onCommit } = useContext(EditableContext)
  const [editing, setEditing] = useState(false)
  const ref = useRef<HTMLElement | null>(null)
  const originalRef = useRef<string>('')

  useEffect(() => {
    if (!editing) return
    const el = ref.current
    if (!el) return
    el.contentEditable = 'true'
    el.focus()
    const range = document.createRange()
    range.selectNodeContents(el)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }, [editing])

  const commit = useCallback(() => {
    const el = ref.current
    if (!el) return
    const value = (el.textContent ?? '').replace(/\u00a0/g, ' ').trim()
    setEditing(false)
    el.contentEditable = 'false'
    if (value !== (text ?? '').trim()) onCommit(field, value)
  }, [field, onCommit, text])

  const cancel = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.textContent = originalRef.current
    el.contentEditable = 'false'
    setEditing(false)
  }, [])

  if (!enabled) {
    return (
      <Tag className={className}>{text}</Tag>
    )
  }

  return (
    <Tag
      ref={(element) => {
        ref.current = element
      }}
      suppressContentEditableWarning
      contentEditable={editing}
      onClick={() => {
        if (editing) return
        originalRef.current = text ?? ''
        setEditing(true)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          cancel()
          return
        }
        if (!multiline && event.key === 'Enter') {
          event.preventDefault()
          commit()
          return
        }
        if (multiline && event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault()
          commit()
        }
      }}
      onBlur={commit}
      title="Click to edit"
      className={cn(
        'cursor-text rounded outline-none transition-colors',
        editing
          ? 'bg-surface-muted shadow-[0_0_0_2px_var(--primary)]'
          : 'hover:bg-surface-muted/60 focus-visible:bg-surface-muted/60',
        multiline && 'min-h-6',
        className
      )}
    >
      {text}
    </Tag>
  )
}
