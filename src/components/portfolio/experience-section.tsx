'use client'

import { useState } from 'react'
import { deleteExperience, reorderExperience } from '@/actions/experience'
import { ExperienceForm } from '@/components/forms/experience-form'
import { Card, CardContent, EmptyState, Badge } from '@/components/ui'
import { Briefcase } from 'lucide-react'
import { ItemActions } from '@/components/portfolio/item-actions'

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

export function ExperienceSection({ entries }: { entries: Entry[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const ids = entries.map((e) => e.id)

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <h2 className="mb-4 text-sm font-semibold">Add experience</h2>
          <ExperienceForm />
        </CardContent>
      </Card>

      {entries.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="size-6" aria-hidden />}
          title="No experience yet"
          description="Internships, part-time jobs, organizations, and freelance all count."
        />
      ) : (
        <ul className="space-y-3">
          {entries.map((entry, index) =>
            editingId === entry.id ? (
              <li key={entry.id} className="rounded-xl border border-border bg-surface p-4">
                <ExperienceForm entry={entry} onCancel={() => setEditingId(null)} />
              </li>
            ) : (
              <li key={entry.id} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-strong text-muted-foreground">
                  <Briefcase className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {entry.position}
                    {entry.current && <Badge tone="success" className="ml-2">Current</Badge>}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {entry.organization}
                    {rangeLabel(entry)}
                  </p>
                </div>
                <ItemActions
                  reorder={reorderExperience}
                  ids={ids}
                  index={index}
                  onEdit={() => setEditingId(entry.id)}
                  deleteAction={deleteExperience.bind(null, entry.id)}
                  deleteLabel="Delete this experience entry?"
                />
              </li>
            )
          )}
        </ul>
      )}
    </div>
  )
}

function rangeLabel(entry: Entry): string {
  const start = [entry.startMonth, entry.startYear].filter(Boolean).join(' ')
  const end = entry.current ? 'Present' : [entry.endMonth, entry.endYear].filter(Boolean).join(' ')
  if (start && end) return ` · ${start} – ${end}`
  return start ? ` · ${start}` : ''
}
