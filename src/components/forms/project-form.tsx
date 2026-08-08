'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { createProject, updateProject } from '@/actions/projects'
import { Alert, FieldError, FieldHint, Input, Label, SubmitButton, Switch, Textarea } from '@/components/ui'
import { ImageUploader } from '@/components/upload/image-uploader'

export function ProjectForm({
  project,
}: {
  project?: {
    id: string
    name: string
    description: string | null
    coverImageUrl: string | null
    technologies: string[]
    githubUrl: string | null
    demoUrl: string | null
    date: string | null
    role: string | null
    featured: boolean
  }
}) {
  const action = project ? updateProject : createProject
  const [state, formAction] = useActionState(action, undefined)
  const techString = project?.technologies.join(', ') ?? ''

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {project && <input type="hidden" name="id" value={project.id} />}
      {state?.message && <Alert tone="error">{state.message}</Alert>}

      <div>
        <Label htmlFor="name">Project name</Label>
        <Input id="name" name="name" placeholder="CampusConnect" defaultValue={project?.name ?? ''} invalid={Boolean(state?.errors?.name)} />
        <FieldError>{state?.errors?.name?.[0]}</FieldError>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          placeholder="What it does, what you learned, what you built."
          defaultValue={project?.description ?? ''}
          invalid={Boolean(state?.errors?.description)}
        />
        <FieldError>{state?.errors?.description?.[0]}</FieldError>
      </div>

      <div>
        <Label htmlFor="coverImageUrl">Cover image</Label>
        <ImageUploader
          fieldName="coverImageUrl"
          defaultValue={project?.coverImageUrl}
          hint="A screenshot or preview of the project, 16:9 works best."
        />
        <FieldError>{state?.errors?.coverImageUrl?.[0]}</FieldError>
      </div>

      <div>
        <Label htmlFor="technologies">Technologies</Label>
        <Input
          id="technologies"
          name="technologies"
          placeholder="React, TypeScript, MySQL"
          defaultValue={techString}
          invalid={Boolean(state?.errors?.technologies)}
        />
        <FieldHint>Separate each technology with a comma.</FieldHint>
        <FieldError>{state?.errors?.technologies?.[0]}</FieldError>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input
            id="githubUrl"
            name="githubUrl"
            type="url"
            placeholder="https://github.com/…"
            defaultValue={project?.githubUrl ?? ''}
            invalid={Boolean(state?.errors?.githubUrl)}
          />
          <FieldError>{state?.errors?.githubUrl?.[0]}</FieldError>
        </div>
        <div>
          <Label htmlFor="demoUrl">Live demo URL</Label>
          <Input
            id="demoUrl"
            name="demoUrl"
            type="url"
            placeholder="https://…"
            defaultValue={project?.demoUrl ?? ''}
            invalid={Boolean(state?.errors?.demoUrl)}
          />
          <FieldError>{state?.errors?.demoUrl?.[0]}</FieldError>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="date">Project date</Label>
          <Input id="date" name="date" placeholder="2025" defaultValue={project?.date ?? ''} invalid={Boolean(state?.errors?.date)} />
          <FieldHint>Any format works: “2025”, “Jan 2025”, “Summer 2025”.</FieldHint>
          <FieldError>{state?.errors?.date?.[0]}</FieldError>
        </div>
        <div>
          <Label htmlFor="role">Your role</Label>
          <Input id="role" name="role" placeholder="Solo developer" defaultValue={project?.role ?? ''} invalid={Boolean(state?.errors?.role)} />
          <FieldError>{state?.errors?.role?.[0]}</FieldError>
        </div>
      </div>

      <FeaturedField checked={project?.featured ?? false} />

      <div className="flex gap-3">
        <SubmitButton pendingLabel="Saving…">{project ? 'Save changes' : 'Add project'}</SubmitButton>
        <Link
          href="/dashboard/portfolio/projects"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border-strong bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}

function FeaturedField({ checked }: { checked: boolean }) {
  const [value, setValue] = useState(checked)
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
      <div>
        <p className="text-sm font-medium">Featured project</p>
        <p className="text-sm text-muted-foreground">Featured projects appear first on your portfolio.</p>
      </div>
      <input type="hidden" name="featured" value={value ? 'on' : 'off'} />
      <Switch checked={value} onChange={setValue} label="Featured project" />
    </div>
  )
}
