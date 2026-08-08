import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { getOwnPortfolioData } from '@/lib/portfolio'
import { parseDesign } from '@/lib/design'
import { PageHeader } from '@/components/dashboard/page-header'
import { Editor } from '@/components/editor/editor'

export const metadata: Metadata = {
  title: 'Editor',
}

export default async function EditorPage() {
  const user = await requireUser()
  if (!user.username) redirect('/onboarding')

  const data = await getOwnPortfolioData(user.id)
  if (!data) redirect('/onboarding')

  const portfolio = await db.portfolio.findUnique({
    where: { userId: user.id },
    select: { design: true, designPublished: true, published: true },
  })

  return (
    <div>
      <PageHeader
        title="Editor"
        description="Drag sections, hide or reorder them, and watch your site update instantly."
      />
      <Editor
        data={data}
        initialDesign={parseDesign(portfolio?.design)}
        publishedDesign={parseDesign(portfolio?.designPublished ?? portfolio?.design)}
        isPublished={portfolio?.published ?? false}
        hasPublishedDesign={portfolio?.designPublished != null}
      />
    </div>
  )
}
