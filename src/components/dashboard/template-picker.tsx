'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setTemplate, publishPortfolio, unpublishPortfolio } from '@/actions/portfolio'
import { Badge, Button } from '@/components/ui'
import { LinkButton } from '@/components/dashboard/page-header'
import { Check, Globe, MonitorSmartphone, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppOrigin } from '@/lib/use-origin'

const templates = [
  {
    id: 'MINIMAL',
    name: 'Minimal',
    description: 'Professional and clean. Let your work speak.',
    preview: 'Centered header, quiet sections, precise type.',
  },
  {
    id: 'DEVELOPER',
    name: 'Developer',
    description: 'Focused on projects, technologies, and GitHub.',
    preview: 'Project grid, timeline, monospace accents.',
  },
  {
    id: 'CREATIVE',
    name: 'Creative',
    description: 'More visual and expressive.',
    preview: 'Bold type, numbered work, strong contrast.',
  },
  {
    id: 'EDITORIAL',
    name: 'Editorial',
    description: 'Magazine-inspired layout.',
    preview: 'Big type, indexed sections, editorial lists.',
  },
] as const

export function TemplatePicker({
  current,
  published,
  username,
}: {
  current: string
  published: boolean
  username: string | null
}) {
  const router = useRouter()
  const [selected, setSelected] = useState(current)
  const [busy, setBusy] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const origin = useAppOrigin()

  async function selectTemplate(id: string) {
    setBusy(id)
    const result = await setTemplate(id)
    setBusy(null)
    if (result.ok) {
      setSelected(id)
      router.refresh()
    } else {
      setError(result.message ?? 'Something went wrong.')
    }
  }

  async function togglePublish() {
    setPublishing(true)
    setError(null)
    const result = published ? await unpublishPortfolio() : await publishPortfolio()
    setPublishing(false)
    if (!result.ok) {
      setError(result.message ?? 'Something went wrong.')
      return
    }
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive-muted p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {templates.map((template) => {
          const isSelected = selected === template.id
          const isBusy = busy === template.id
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => selectTemplate(template.id)}
              disabled={busy !== null}
              aria-pressed={isSelected}
              className={cn(
                'relative rounded-xl border-2 bg-surface p-5 text-left transition-colors',
                'disabled:pointer-events-none disabled:opacity-60',
                isSelected ? 'border-primary' : 'border-border hover:border-border-strong'
              )}
            >
              {isSelected && (
                <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-4" aria-hidden />
                </span>
              )}
              <h3 className="font-semibold">{template.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
              <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">{template.preview}</p>
              {isBusy && <p className="mt-2 text-xs text-primary">Applying…</p>}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <LinkButton href="/dashboard/preview?view=mobile" variant="secondary">
          <MonitorSmartphone className="size-4" aria-hidden /> Preview on phone
        </LinkButton>
        <LinkButton href="/dashboard/preview" variant="secondary">
          <Eye className="size-4" aria-hidden /> Preview
        </LinkButton>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Your public website</h3>
              {published ? <Badge tone="success">Published</Badge> : <Badge tone="warning">Draft</Badge>}
            </div>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {username ? (
                <>
                  {origin ? `${origin}/` : '…/'}
                  <span className="text-foreground">{username}</span>
                </>
              ) : (
                'Choose a username before publishing.'
              )}
            </p>
          </div>
          <div className="flex gap-3">
            {username && published && (
              <LinkButton href={`/${username}`} variant="outline" target="_blank">
                <Globe className="size-4" aria-hidden /> Visit site
              </LinkButton>
            )}
            <Button
              variant={published ? 'outline' : 'primary'}
              loading={publishing}
              onClick={togglePublish}
              className={published ? 'border-destructive/40 text-destructive hover:bg-destructive-muted' : undefined}
            >
              {published ? 'Unpublish portfolio' : 'Publish portfolio'}
            </Button>
          </div>
        </div>
        {!published && (
          <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
            When published, anyone can visit your portfolio at your personal URL. Unpublishing makes it visible only to you.
          </p>
        )}
      </div>
    </div>
  )
}
