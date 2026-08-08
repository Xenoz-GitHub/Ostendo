import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { PageHeader } from '@/components/dashboard/page-header'
import { ExperienceSection } from '@/components/portfolio/experience-section'

export const metadata: Metadata = {
  title: 'Experience',
}

export default async function ExperiencePage() {
  const user = await requireUser()
  const entries = await db.experience.findMany({
    where: { userId: user.id },
    orderBy: { orderIndex: 'asc' },
    select: {
      id: true,
      organization: true,
      position: true,
      description: true,
      startMonth: true,
      startYear: true,
      endMonth: true,
      endYear: true,
      current: true,
    },
  })

  return (
    <div>
      <PageHeader
        title="Experience"
        description="Internships, jobs, organizations, and freelance work."
      />
      <ExperienceSection entries={entries} />
    </div>
  )
}
