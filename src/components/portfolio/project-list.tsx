'use client'

import Link from 'next/link'
import { deleteProject, reorderProjects, toggleFeaturedProject } from '@/actions/projects'
import { EmptyState, Badge } from '@/components/ui'
import { FolderKanban, Plus } from 'lucide-react'
import { ItemActions, FeaturedToggle } from '@/components/portfolio/item-actions'

type ProjectRow = {
  id: string
  name: string
  description: string | null
  coverImageUrl: string | null
  date: string | null
  featured: boolean
}

export function ProjectList({ projects }: { projects: ProjectRow[] }) {
  const ids = projects.map((p) => p.id)

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<FolderKanban className="size-6" aria-hidden />}
        title="No projects yet"
        description="Add your first project to start building your portfolio."
        action={
          <Link
            href="/dashboard/portfolio/projects/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="size-4" aria-hidden /> Add project
          </Link>
        }
      />
    )
  }

  return (
    <ul className="space-y-3">
      {projects.map((project, index) => (
        <li
          key={project.id}
          className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4"
        >
          {project.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.coverImageUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-lg border border-border object-cover"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface-strong text-sm font-semibold text-muted-foreground">
              {project.name.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/dashboard/portfolio/projects/${project.id}`} className="truncate text-sm font-semibold hover:underline">
                {project.name}
              </Link>
              {project.featured && <Badge tone="warning">Featured</Badge>}
            </div>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {project.description || project.date || 'No description yet'}
            </p>
          </div>
          <ItemActions
            reorder={reorderProjects}
            ids={ids}
            index={index}
            editHref={`/dashboard/portfolio/projects/${project.id}`}
            deleteAction={deleteProject.bind(null, project.id)}
            deleteLabel="Delete this project? This cannot be undone."
            extra={
              <FeaturedToggle
                featured={project.featured}
                onToggle={() => toggleFeaturedProject(project.id)}
                label={project.featured ? 'Remove from featured' : 'Mark as featured'}
              />
            }
          />
        </li>
      ))}
    </ul>
  )
}
