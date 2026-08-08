'use client'

import { useActionState } from 'react'
import { createEducation, updateEducation } from '@/actions/education'
import { Alert, Button, FieldError, Input, Label, SubmitButton, Textarea } from '@/components/ui'

type Entry = {
  id: string
  institution: string
  degree: string | null
  field: string | null
  startYear: number | null
  endYear: number | null
  description: string | null
}

export function EducationForm({ entry, onCancel }: { entry?: Entry; onCancel?: () => void }) {
  const action = entry ? updateEducation : createEducation
  const [state, formAction] = useActionState(action, undefined)

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {entry && <input type="hidden" name="id" value={entry.id} />}
      {state?.message && <Alert tone="error">{state.message}</Alert>}

      <div>
        <Label htmlFor={`institution-${entry?.id ?? 'new'}`}>School or university</Label>
        <Input
          id={`institution-${entry?.id ?? 'new'}`}
          name="institution"
          defaultValue={entry?.institution ?? ''}
          invalid={Boolean(state?.errors?.institution)}
        />
        <FieldError>{state?.errors?.institution?.[0]}</FieldError>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor={`degree-${entry?.id ?? 'new'}`}>Degree</Label>
          <Input
            id={`degree-${entry?.id ?? 'new'}`}
            name="degree"
            placeholder="Bachelor of Science"
            defaultValue={entry?.degree ?? ''}
            invalid={Boolean(state?.errors?.degree)}
          />
          <FieldError>{state?.errors?.degree?.[0]}</FieldError>
        </div>
        <div>
          <Label htmlFor={`field-${entry?.id ?? 'new'}`}>Field</Label>
          <Input
            id={`field-${entry?.id ?? 'new'}`}
            name="field"
            placeholder="Computer Science"
            defaultValue={entry?.field ?? ''}
            invalid={Boolean(state?.errors?.field)}
          />
          <FieldError>{state?.errors?.field?.[0]}</FieldError>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <Label htmlFor={`startYear-${entry?.id ?? 'new'}`}>Start year</Label>
          <Input
            id={`startYear-${entry?.id ?? 'new'}`}
            name="startYear"
            type="number"
            inputMode="numeric"
            min={1950}
            max={2100}
            placeholder="2024"
            defaultValue={entry?.startYear?.toString() ?? ''}
            invalid={Boolean(state?.errors?.startYear)}
          />
          <FieldError>{state?.errors?.startYear?.[0]}</FieldError>
        </div>
        <div>
          <Label htmlFor={`endYear-${entry?.id ?? 'new'}`}>Graduation year</Label>
          <Input
            id={`endYear-${entry?.id ?? 'new'}`}
            name="endYear"
            type="number"
            inputMode="numeric"
            min={1950}
            max={2100}
            placeholder="2028"
            defaultValue={entry?.endYear?.toString() ?? ''}
            invalid={Boolean(state?.errors?.endYear)}
          />
          <FieldError>{state?.errors?.endYear?.[0]}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor={`description-${entry?.id ?? 'new'}`}>Description</Label>
        <Textarea
          id={`description-${entry?.id ?? 'new'}`}
          name="description"
          rows={3}
          defaultValue={entry?.description ?? ''}
          invalid={Boolean(state?.errors?.description)}
        />
        <FieldError>{state?.errors?.description?.[0]}</FieldError>
      </div>

      <div className="flex gap-3">
        <SubmitButton pendingLabel="Saving…">{entry ? 'Save changes' : 'Add education'}</SubmitButton>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
