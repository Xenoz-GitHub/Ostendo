import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { PageHeader } from '@/components/dashboard/page-header'
import { TemplatePicker } from '@/components/dashboard/template-picker'

export const metadata: Metadata = {
  title: 'Template',
}

export default async function TemplatePage() {
  const user = await requireUser()
  const portfolio = await db.portfolio.findUnique({
    where: { userId: user.id },
    select: { template: true, published: true },
  })

  return (
    <div>
      <PageHeader
        title="Template"
        description="Changing a template changes the look — never your content."
      />
      <TemplatePicker
        current={portfolio?.template ?? 'MINIMAL'}
        published={portfolio?.published ?? false}
        username={user.username}
      />
    </div>
  )
}
