import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { PageHeader } from '@/components/dashboard/page-header'
import { EducationSection } from '@/components/portfolio/education-section'

export const metadata: Metadata = {
  title: 'Education',
}

export default async function EducationPage() {
  const user = await requireUser()
  const entries = await db.education.findMany({
    where: { userId: user.id },
    orderBy: { orderIndex: 'asc' },
    select: {
      id: true,
      institution: true,
      degree: true,
      field: true,
      startYear: true,
      endYear: true,
      description: true,
    },
  })

  return (
    <div>
      <PageHeader
        title="Education"
        description="Your school, degree, and field of study."
      />
      <EducationSection entries={entries} />
    </div>
  )
}
