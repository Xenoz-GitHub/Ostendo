import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { PageHeader } from '@/components/dashboard/page-header'
import { SocialSection } from '@/components/portfolio/social-section'

export const metadata: Metadata = {
  title: 'Social links',
}

export default async function SocialPage() {
  const user = await requireUser()
  const links = await db.socialLink.findMany({
    where: { userId: user.id },
    orderBy: { orderIndex: 'asc' },
    select: { id: true, type: true, url: true, label: true, visible: true },
  })

  return (
    <div>
      <PageHeader
        title="Social links"
        description="Choose which links appear on your portfolio."
      />
      <SocialSection links={links} />
    </div>
  )
}
