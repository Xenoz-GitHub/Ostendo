import { requireUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { appBaseUrl } from '@/lib/site'
import { LinkButton } from '@/components/dashboard/page-header'
import { EmailVerifyBanner } from '@/components/dashboard/email-verify-banner'
import { Badge, Card, CardContent } from '@/components/ui'
import { Plus, Eye, LayoutTemplate, MousePointerClick, Palette, UserRound, Globe, CheckCircle2, Circle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default async function HomePage() {
  const user = await requireUser()
  const [profile, portfolio, projectCount, educationCount, experienceCount, skillCount] =
    await Promise.all([
      db.profile.findUnique({
        where: { userId: user.id },
        select: {
          headline: true,
          bio: true,
          university: true,
          location: true,
        },
      }),
      db.portfolio.findUnique({
        where: { userId: user.id },
        select: { published: true, publishedAt: true },
      }),
      db.project.count({ where: { userId: user.id } }),
      db.education.count({ where: { userId: user.id } }),
      db.experience.count({ where: { userId: user.id } }),
      db.skill.count({ where: { userId: user.id } }),
    ])

  const published = portfolio?.published ?? false
  const baseUrl = await appBaseUrl()
  const firstName = user.name?.split(' ')[0] ?? 'there'

  const checklist = [
    { label: 'Choose your username', done: Boolean(user.username) },
    { label: 'Add your name', done: Boolean(user.name) },
    { label: 'Write a headline', done: Boolean(profile?.headline) },
    { label: 'Write a short bio', done: Boolean(profile?.bio) },
    { label: 'Add a profile photo', done: Boolean(user.avatarUrl) },
    { label: 'Add your university', done: Boolean(profile?.university) },
    { label: 'Add at least one project', done: projectCount > 0 },
    { label: 'Add at least one education entry', done: educationCount > 0 },
    { label: 'Add at least one skill', done: skillCount > 0 },
    { label: 'Publish your portfolio', done: published },
  ]
  const doneCount = checklist.filter((item) => item.done).length
  const progress = Math.round((doneCount / checklist.length) * 100)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting()}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {published
              ? 'Your portfolio is live and ready to share.'
              : 'A few steps away from a portfolio you can share.'}
          </p>
        </div>
        <LinkButton href="/dashboard/portfolio/projects/new">
          <Plus className="size-4" aria-hidden /> Add project
        </LinkButton>
      </div>

      {!user.emailVerifiedAt && <EmailVerifyBanner />}

      <Card className={cn(published ? 'border-success/30' : 'border-warning/30')}>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span
              className={cn(
                'flex size-11 items-center justify-center rounded-full',
                published ? 'bg-success-muted text-success' : 'bg-warning-muted text-warning'
              )}
            >
              <Globe className="size-5" aria-hidden />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">
                  {published ? 'Your portfolio is published' : 'Your portfolio is a draft'}
                </p>
                {published && <Badge tone="success">Live</Badge>}
              </div>
              <p className="font-mono text-sm text-muted-foreground">
                {user.username ? (
                  <>
                    {baseUrl}/<span className="text-foreground">{user.username}</span>
                  </>
                ) : (
                  'Choose a username to get your personal URL.'
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {user.username && (
              <>
                <LinkButton href="/dashboard/preview" variant="secondary">
                  <Eye className="size-4" aria-hidden /> Preview
                </LinkButton>
                {published && (
                  <LinkButton href={`/${user.username}`} variant="secondary">
                    <Globe className="size-4" aria-hidden /> Visit site
                  </LinkButton>
                )}
              </>
            )}
            <LinkButton href="/dashboard/template" variant="secondary">
              <LayoutTemplate className="size-4" aria-hidden /> {published ? 'Change template' : 'Choose template'}
            </LinkButton>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Profile completion</h2>
              <span className="text-sm font-medium text-muted-foreground">{progress}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Profile completion"
              className="mb-5 h-2 overflow-hidden rounded-full bg-surface-strong"
            >
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <ul className="space-y-2.5">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-3 text-sm">
                  {item.done ? (
                    <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden />
                  ) : (
                    <Circle className="size-5 shrink-0 text-border-strong" aria-hidden />
                  )}
                  <span className={cn(item.done ? 'text-muted-foreground line-through decoration-border-strong' : 'text-foreground')}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent>
              <h2 className="mb-4 text-base font-semibold">Your content</h2>
              <dl className="grid grid-cols-2 gap-4">
                <Stat label="Projects" value={projectCount} />
                <Stat label="Education" value={educationCount} />
                <Stat label="Experience" value={experienceCount} />
                <Stat label="Skills" value={skillCount} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="mb-4 text-base font-semibold">Quick actions</h2>
              <ul className="space-y-1">
                <QuickAction href="/dashboard/profile" icon={<UserRound className="size-4" aria-hidden />}>
                  Edit your profile
                </QuickAction>
                <QuickAction href="/dashboard/portfolio/projects" icon={<Plus className="size-4" aria-hidden />}>
                  Manage projects
                </QuickAction>
                <QuickAction href="/dashboard/template" icon={<LayoutTemplate className="size-4" aria-hidden />}>
                  Choose a template
                </QuickAction>
                <QuickAction href="/dashboard/editor" icon={<MousePointerClick className="size-4" aria-hidden />}>
                  Open the visual editor
                </QuickAction>
                <QuickAction href="/dashboard/design" icon={<Palette className="size-4" aria-hidden />}>
                  Style with a design palette
                </QuickAction>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-surface-muted p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-2xl font-bold tabular-nums">{value}</dd>
    </div>
  )
}

function QuickAction({
  href,
  icon,
  children,
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
      >
        {icon}
        {children}
      </Link>
    </li>
  )
}
