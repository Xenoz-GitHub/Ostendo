'use client'

import { useActionState, useState } from 'react'
import { createSkill, deleteSkill, reorderSkills } from '@/actions/skills'
import { EmptyState, FieldError, Input, Label, SubmitButton } from '@/components/ui'
import { Wrench } from 'lucide-react'
import { ItemActions } from '@/components/portfolio/item-actions'

export function SkillsSection({ skills }: { skills: { id: string; name: string }[] }) {
  return (
    <div className="space-y-6">
      <AddSkillForm />
      {skills.length === 0 ? (
        <EmptyState
          icon={<Wrench className="size-6" aria-hidden />}
          title="No skills yet"
          description="Add the technologies and abilities you know."
        />
      ) : (
        <ul className="flex flex-wrap items-center gap-2">
          {skills.map((skill, index) => (
            <li
              key={skill.id}
              className="flex items-center gap-1 rounded-full border border-border bg-surface py-1 pl-3 pr-1 text-sm"
            >
              {skill.name}
              <ItemActions
                reorder={reorderSkills}
                ids={skills.map((s) => s.id)}
                index={index}
                deleteAction={deleteSkill.bind(null, skill.id)}
                deleteLabel={`Remove “${skill.name}” from your skills?`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AddSkillForm() {
  const [state, action] = useActionState(createSkill, undefined)
  const [value, setValue] = useState('')

  return (
    <form action={action} className="flex items-end gap-3" noValidate>
      <div className="flex-1">
        <Label htmlFor="skill-name">Add a skill</Label>
        <Input
          id="skill-name"
          name="name"
          placeholder="React, Figma, SQL…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          invalid={Boolean(state?.errors?.name)}
        />
        <FieldError>{state?.errors?.name?.[0]}</FieldError>
      </div>
      <SubmitButton pendingLabel="Adding…">Add</SubmitButton>
    </form>
  )
}
