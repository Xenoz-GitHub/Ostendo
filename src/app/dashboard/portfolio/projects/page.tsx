import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { PageHeader, LinkButton } from '@/components/dashboard/page-header'
import { Skeleton } from '@/components/ui'
import { Plus } from 'lucide-react'
import { ProjectList } from '@/components/portfolio/project-list'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Projects',
}

export default async function ProjectsPage() {
  const user = await requireUser()
  const projects = await db.project.findMany({
    where: { userId: user.id },
    orderBy: [{ featured: 'desc' }, { orderIndex: 'asc' }],
    select: {
      id: true,
      name: true,
      description: true,
      coverImageUrl: true,
      date: true,
      featured: true,
    },
  })

  return (
    <div>
      <PageHeader
        title="Projects"
        description="The work you want people to see first."
        action={<LinkButton href="/dashboard/portfolio/projects/new"><Plus className="size-4" aria-hidden /> Add project</LinkButton>}
      />
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <ProjectList projects={projects} />
      </Suspense>
    </div>
  )
}
