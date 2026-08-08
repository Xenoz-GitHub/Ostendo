import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent } from '@/components/ui'
import { ProjectForm } from '@/components/forms/project-form'

export const metadata: Metadata = {
  title: 'Edit project',
}

export default async function EditProjectPage(props: PageProps<'/dashboard/portfolio/projects/[id]'>) {
  const user = await requireUser()
  const { id } = await props.params

  const project = await db.project.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      name: true,
      description: true,
      coverImageUrl: true,
      technologies: true,
      githubUrl: true,
      demoUrl: true,
      date: true,
      role: true,
      featured: true,
    },
  })
  if (!project) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Edit project" description={project.name} />
      <Card>
        <CardContent>
          <ProjectForm
            project={{
              ...project,
              technologies: Array.isArray(project.technologies) ? (project.technologies as string[]) : [],
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
