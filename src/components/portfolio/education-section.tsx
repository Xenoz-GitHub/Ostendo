'use client'

import { useState } from 'react'
import { deleteEducation, reorderEducation } from '@/actions/education'
import { EducationForm } from '@/components/forms/education-form'
import { Card, CardContent, EmptyState } from '@/components/ui'
import { GraduationCap } from 'lucide-react'
import { ItemActions } from '@/components/portfolio/item-actions'

type Entry = {
  id: string
  institution: string
  degree: string | null
  field: string | null
  startYear: number | null
  endYear: number | null
  description: string | null
}

export function EducationSection({ entries }: { entries: Entry[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const ids = entries.map((e) => e.id)

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <h2 className="mb-4 text-sm font-semibold">Add education</h2>
          <EducationForm />
        </CardContent>
      </Card>

      {entries.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="size-6" aria-hidden />}
          title="No education yet"
          description="Add the school, degree, and field that shaped you."
        />
      ) : (
        <ul className="space-y-3">
          {entries.map((entry, index) =>
            editingId === entry.id ? (
              <li key={entry.id} className="rounded-xl border border-border bg-surface p-4">
                <EducationForm entry={entry} onCancel={() => setEditingId(null)} />
              </li>
            ) : (
              <li key={entry.id} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-strong text-muted-foreground">
                  <GraduationCap className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {entry.degree ? `${entry.degree}${entry.field ? ` in ${entry.field}` : ''}` : entry.institution}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {entry.institution}
                    {entry.startYear || entry.endYear ? ` · ${entry.startYear ?? '?'}–${entry.endYear ?? 'present'}` : ''}
                  </p>
                </div>
                <ItemActions
                  reorder={reorderEducation}
                  ids={ids}
                  index={index}
                  onEdit={() => setEditingId(entry.id)}
                  deleteAction={deleteEducation.bind(null, entry.id)}
                  deleteLabel="Delete this education entry?"
                />
              </li>
            )
          )}
        </ul>
      )}
    </div>
  )
}
