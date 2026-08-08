'use client'

import { Mail, Trash2 } from 'lucide-react'
import { markContactMessageRead, deleteContactMessage } from '@/actions/messages'
import { cn } from '@/lib/utils'

export type MessageItem = {
  id: string
  visitorName: string
  visitorEmail: string
  message: string
  readAt: Date | null
  createdAt: Date
}

export function MessagesList({ messages }: { messages: MessageItem[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-6 py-16 text-center">
        <Mail className="size-8 text-muted-foreground" aria-hidden />
        <p className="font-medium">No messages yet</p>
        <p className="text-sm text-muted-foreground">
          When visitors send you a message through the Contact section of your portfolio, it shows up here.
        </p>
      </div>
    )
  }

  const unreadCount = messages.filter((m) => !m.readAt).length

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <p className="text-sm text-muted-foreground">
          {unreadCount} unread message{unreadCount === 1 ? '' : 's'}
        </p>
      )}
      <ul className="space-y-3">
        {messages.map((message) => (
          <MessageCard key={message.id} message={message} />
        ))}
      </ul>
    </div>
  )
}

function MessageCard({ message }: { message: MessageItem }) {
  const unread = !message.readAt

  return (
    <li
      className={cn(
        'rounded-xl border bg-surface p-4',
        unread ? 'border-primary/40' : 'border-border'
      )}
    >
      <button
        type="button"
        onClick={() => void markContactMessageRead(message.id)}
        className="block w-full text-left"
        aria-label={unread ? 'Mark as read' : undefined}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div className="flex items-center gap-2">
            {unread && (
              <span
                className="size-2 shrink-0 rounded-full bg-primary"
                aria-label="Unread"
                role="img"
              />
            )}
            <h3 className="font-semibold">{message.visitorName}</h3>
          </div>
          <time className="text-xs text-muted-foreground">{formatDate(message.createdAt)}</time>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          <a href={`mailto:${message.visitorEmail}`} className="underline-offset-2 hover:underline">
            {message.visitorEmail}
          </a>
        </p>
        <p className={cn('mt-3 whitespace-pre-wrap text-sm leading-relaxed', unread ? 'text-foreground' : 'text-muted-foreground')}>
          {message.message}
        </p>
      </button>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => void deleteContactMessage(message.id)}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <Trash2 className="size-4" aria-hidden /> Delete
        </button>
      </div>
    </li>
  )
}

function formatDate(date: Date): string {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
