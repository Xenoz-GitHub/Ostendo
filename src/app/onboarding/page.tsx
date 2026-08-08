import { requireUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { LogoLink } from '@/components/brand'
import { Card, CardContent } from '@/components/ui'
import { UsernameForm } from '@/components/onboarding/username-form'
import { ProfileForm } from '@/components/forms/profile-form'

export default async function OnboardingPage(props: PageProps<'/onboarding'>) {
  const user = await requireUser()
  const searchParams = await props.searchParams
  const step = user.username || searchParams.step === 'profile' ? 'profile' : 'username'

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
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center px-5 py-4 sm:px-8">
        <LogoLink />
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10">
        <ol aria-label="Progress" className="mb-8 flex items-center gap-2">
          <StepDot active={step === 'username'} done={step === 'profile'} label="Choose your URL" />
          <StepLine done={step === 'profile'} />
          <StepDot active={step === 'profile'} label="Your profile" />
        </ol>

        <Card>
          <CardContent>
            {step === 'username' ? (
              <>
                <h1 className="text-xl font-bold tracking-tight">Claim your URL</h1>
                <p className="mb-6 mt-1 text-sm text-muted-foreground">
                  This is the address people will share. Make it yours.
                </p>
                <UsernameForm />
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold tracking-tight">Tell people who you are</h1>
                <p className="mb-6 mt-1 text-sm text-muted-foreground">
                  The essentials only — you can add everything else from your dashboard.
                </p>
                <ProfileForm
                  onboarding
                  submitLabel="Save & continue"
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
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function StepDot({ active, done, label }: { active: boolean; done?: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={
          active
            ? 'flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground'
            : done
              ? 'flex size-7 items-center justify-center rounded-full bg-success text-xs font-bold text-white'
              : 'flex size-7 items-center justify-center rounded-full border border-border-strong text-xs font-medium text-muted-foreground'
        }
      >
        {done ? '✓' : active ? '1' : '2'}
      </span>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </li>
  )
}

function StepLine({ done }: { done: boolean }) {
  return <li aria-hidden className={done ? 'h-px w-10 bg-success' : 'h-px w-10 bg-border-strong'} />
}
