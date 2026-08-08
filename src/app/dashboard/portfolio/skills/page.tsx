import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { PageHeader } from '@/components/dashboard/page-header'
import { SkillsSection } from '@/components/portfolio/skills-section'

export const metadata: Metadata = {
  title: 'Skills',
}

export default async function SkillsPage() {
  const user = await requireUser()
  const skills = await db.skill.findMany({
    where: { userId: user.id },
    orderBy: { orderIndex: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <div>
      <PageHeader
        title="Skills"
        description="Technologies and abilities you know."
      />
      <SkillsSection skills={skills} />
    </div>
  )
}
