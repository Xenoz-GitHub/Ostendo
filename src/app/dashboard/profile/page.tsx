import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { ProfileForm } from '@/components/forms/profile-form'

export const metadata: Metadata = {
  title: 'Profile',
}

export default async function ProfilePage() {
  const user = await requireUser()
  const profile = await db.profile.findUnique({
    where: { userId: user.id },
    select: {
      headline: true,
      bio: true,
      university: true,
      major: true,
      graduationYear: true,
      location: true,
      contactEmail: true,
      websiteUrl: true,
    },
  })

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Profile"
        description="Your professional identity, reused across every template."
      />
      <Card>
        <CardHeader>
          <CardTitle>Profile details</CardTitle>
          <CardDescription>Shown on your public portfolio.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaults={{
              name: user.name,
              avatarUrl: user.avatarUrl,
              headline: profile?.headline ?? null,
              bio: profile?.bio ?? null,
              university: profile?.university ?? null,
              major: profile?.major ?? null,
              graduationYear: profile?.graduationYear ?? null,
              location: profile?.location ?? null,
              contactEmail: profile?.contactEmail ?? null,
              websiteUrl: profile?.websiteUrl ?? null,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
