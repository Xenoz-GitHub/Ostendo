import type { Metadata } from 'next'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent } from '@/components/ui'
import { ProjectForm } from '@/components/forms/project-form'

export const metadata: Metadata = {
  title: 'Add project',
}

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Add project"
        description="Share the work you're proud of."
      />
      <Card>
        <CardContent>
          <ProjectForm />
        </CardContent>
      </Card>
    </div>
  )
}
