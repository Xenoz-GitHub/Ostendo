'use client'

import { useActionState, useState } from 'react'
import {
  createSocialLink,
  deleteSocialLink,
  reorderSocialLinks,
  toggleSocialLinkVisibility,
  updateSocialLink,
} from '@/actions/social'
import {
  Alert,
  Button,
  EmptyState,
  FieldError,
  Input,
  Label,
  Select,
  SubmitButton,
  Switch,
} from '@/components/ui'
import { Eye, EyeOff, Link2 } from 'lucide-react'
import { ItemActions } from '@/components/portfolio/item-actions'
import { cn } from '@/lib/utils'
import { SocialIcon } from '@/components/portfolio/templates/shared'

type LinkRow = {
  id: string
  type: 'GITHUB' | 'LINKEDIN' | 'INSTAGRAM' | 'X' | 'YOUTUBE' | 'EMAIL' | 'WEBSITE' | 'OTHER'
  url: string
  label: string | null
  visible: boolean
}

const TYPES = [
  { value: 'GITHUB', label: 'GitHub' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'X', label: 'X (Twitter)' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'OTHER', label: 'Other' },
]

export function SocialSection({ links }: { links: LinkRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <AddSocialForm />
      {links.length === 0 ? (
        <EmptyState
          icon={<Link2 className="size-6" aria-hidden />}
          title="No social links yet"
          description="Add GitHub, LinkedIn, or any other link you want to show."
        />
      ) : (
        <ul className="space-y-3">
          {links.map((link, index) =>
            editingId === link.id ? (
              <li key={link.id} className="rounded-xl border border-border bg-surface p-4">
                <EditSocialForm link={link} onCancel={() => setEditingId(null)} />
              </li>
            ) : (
              <li
                key={link.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-strong text-muted-foreground">
                  <SocialIcon type={link.type} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {link.label || TYPES.find((t) => t.value === link.type)?.label || link.type}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{link.url}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSocialLinkVisibility(link.id)}
                  aria-label={link.visible ? 'Hide from portfolio' : 'Show on portfolio'}
                  title={link.visible ? 'Visible on your portfolio' : 'Hidden from your portfolio'}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-lg transition-colors',
                    link.visible
                      ? 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'
                      : 'bg-surface-strong text-muted-foreground'
                  )}
                >
                  {link.visible ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
                </button>
                <ItemActions
                  reorder={reorderSocialLinks}
                  ids={links.map((l) => l.id)}
                  index={index}
                  onEdit={() => setEditingId(link.id)}
                  deleteAction={deleteSocialLink.bind(null, link.id)}
                  deleteLabel="Delete this link?"
                />
              </li>
            )
          )}
        </ul>
      )}
    </div>
  )
}

function AddSocialForm() {
  const [state, action] = useActionState(createSocialLink, undefined)
  const [visible, setVisible] = useState(true)

  return (
    <form action={action} className="space-y-4 rounded-xl border border-border bg-surface p-4" noValidate>
      {state?.message && <Alert tone="error">{state.message}</Alert>}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="social-type">Platform</Label>
          <Select id="social-type" name="type" defaultValue="GITHUB" invalid={Boolean(state?.errors?.type)}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          <FieldError>{state?.errors?.type?.[0]}</FieldError>
        </div>
        <div>
          <Label htmlFor="social-url">URL</Label>
          <Input
            id="social-url"
            name="url"
            placeholder="https://github.com/you"
            invalid={Boolean(state?.errors?.url)}
          />
          <FieldError>{state?.errors?.url?.[0]}</FieldError>
        </div>
        <div>
          <Label htmlFor="social-label">Label (optional)</Label>
          <Input id="social-label" name="label" placeholder="My GitHub" invalid={Boolean(state?.errors?.label)} />
          <FieldError>{state?.errors?.label?.[0]}</FieldError>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Show on my portfolio</p>
        <input type="hidden" name="visible" value={visible ? 'on' : 'off'} />
        <Switch checked={visible} onChange={setVisible} label="Show on portfolio" />
      </div>
      <div className="flex justify-end">
        <SubmitButton pendingLabel="Adding…">Add link</SubmitButton>
      </div>
    </form>
  )
}

function EditSocialForm({ link, onCancel }: { link: LinkRow; onCancel: () => void }) {
  const [state, action] = useActionState(updateSocialLink, undefined)
  const [visible, setVisible] = useState(link.visible)

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="id" value={link.id} />
      {state?.message && <Alert tone="error">{state.message}</Alert>}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor={`type-${link.id}`}>Platform</Label>
          <Select id={`type-${link.id}`} name="type" defaultValue={link.type}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`url-${link.id}`}>URL</Label>
          <Input id={`url-${link.id}`} name="url" defaultValue={link.url} invalid={Boolean(state?.errors?.url)} />
          <FieldError>{state?.errors?.url?.[0]}</FieldError>
        </div>
        <div>
          <Label htmlFor={`label-${link.id}`}>Label (optional)</Label>
          <Input id={`label-${link.id}`} name="label" defaultValue={link.label ?? ''} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Show on my portfolio</p>
        <input type="hidden" name="visible" value={visible ? 'on' : 'off'} />
        <Switch checked={visible} onChange={setVisible} label="Show on portfolio" />
      </div>
      <div className="flex gap-3">
        <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
