import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { getOwnPortfolioData } from '@/lib/portfolio'
import { PageHeader } from '@/components/dashboard/page-header'
import { PreviewShell } from '@/components/dashboard/preview-shell'
import { TemplateRenderer } from '@/components/portfolio/templates/registry'

export const metadata: Metadata = {
  title: 'Preview',
}

export default async function PreviewPage(props: PageProps<'/dashboard/preview'>) {
  const user = await requireUser()
  if (!user.username) redirect('/onboarding')

  const searchParams = await props.searchParams
  const initialView = searchParams.view === 'mobile' ? 'mobile' : 'desktop'

  const data = await getOwnPortfolioData(user.id)
  if (!data) redirect('/onboarding')

  return (
    <div>
      <PageHeader
        title="Preview"
        description="This is exactly what visitors will see."
      />
      <PreviewShell initialView={initialView}>
        <TemplateRenderer data={data} />
      </PreviewShell>
    </div>
  )
}
