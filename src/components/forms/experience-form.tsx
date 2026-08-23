'use client'

import { useActionState } from 'react'
import { createExperience, updateExperience } from '@/actions/experience'
import { Alert, Button, FieldError, Input, Label, SubmitButton, Switch, Textarea } from '@/components/ui'
import { useState } from 'react'

type Entry = {
  id: string
  organization: string
  position: string
  description: string | null
  startMonth: string | null
  startYear: number | null
  endMonth: string | null
  endYear: number | null
  current: boolean
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function ExperienceForm({ entry, onCancel }: { entry?: Entry; onCancel?: () => void }) {
  const action = entry ? updateExperience : createExperience
  const [state, formAction] = useActionState(action, undefined)
  const [current, setCurrent] = useState(entry?.current ?? false)
  const key = entry?.id ?? 'new'

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {entry && <input type="hidden" name="id" value={entry.id} />}
      {state?.message && <Alert tone="error">{state.message}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor={`organization-${key}`}>Company or organization</Label>
          <Input
            id={`organization-${key}`}
            name="organization"
            placeholder="Tech Solutions Inc."
            defaultValue={entry?.organization ?? ''}
            invalid={Boolean(state?.errors?.organization)}
          />
          <FieldError>{state?.errors?.organization?.[0]}</FieldError>
        </div>
        <div>
          <Label htmlFor={`position-${key}`}>Position</Label>
          <Input
            id={`position-${key}`}
            name="position"
            placeholder="Software Intern"
            defaultValue={entry?.position ?? ''}
            invalid={Boolean(state?.errors?.position)}
          />
          <FieldError>{state?.errors?.position?.[0]}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor={`description-${key}`}>Description</Label>
        <Textarea
          id={`description-${key}`}
          name="description"
          rows={3}
          placeholder="What you did, learned, and delivered."
          defaultValue={entry?.description ?? ''}
          invalid={Boolean(state?.errors?.description)}
        />
        <FieldError>{state?.errors?.description?.[0]}</FieldError>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
        <div>
          <Label htmlFor={`startMonth-${key}`}>Start month</Label>
          <select
            id={`startMonth-${key}`}
            name="startMonth"
            defaultValue={entry?.startMonth ?? ''}
            className="h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm"
          >
            <option value="">—</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor={`startYear-${key}`}>Start year</Label>
          <Input
            id={`startYear-${key}`}
            name="startYear"
            type="number"
            inputMode="numeric"
            min={1950}
            max={2100}
            placeholder="2025"
            defaultValue={entry?.startYear?.toString() ?? ''}
            invalid={Boolean(state?.errors?.startYear)}
          />
          <FieldError>{state?.errors?.startYear?.[0]}</FieldError>
        </div>
        <div>
          <Label htmlFor={`endMonth-${key}`}>End month</Label>
          <select
            id={`endMonth-${key}`}
            name="endMonth"
            defaultValue={entry?.endMonth ?? ''}
            disabled={current}
            className="h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm disabled:opacity-50"
          >
            <option value="">—</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor={`endYear-${key}`}>End year</Label>
          <Input
            id={`endYear-${key}`}
            name="endYear"
            type="number"
            inputMode="numeric"
            min={1950}
            max={2100}
            placeholder="2026"
            disabled={current}
            defaultValue={entry?.endYear?.toString() ?? ''}
            invalid={Boolean(state?.errors?.endYear)}
          />
          <FieldError>{state?.errors?.endYear?.[0]}</FieldError>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
        <div>
          <p className="text-sm font-medium">Current position</p>
          <p className="text-sm text-muted-foreground">You still work here.</p>
        </div>
        <input type="hidden" name="current" value={current ? 'on' : 'off'} />
        <Switch checked={current} onChange={setCurrent} label="Current position" />
      </div>

      <div className="flex gap-3">
        <SubmitButton pendingLabel="Saving…">{entry ? 'Save changes' : 'Add experience'}</SubmitButton>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
