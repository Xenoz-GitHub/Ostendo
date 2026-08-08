import { requireUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { PageHeader, LinkButton } from '@/components/dashboard/page-header'
import { FolderKanban, GraduationCap, Briefcase, Wrench, Link2, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const sections = [
  { href: '/dashboard/portfolio/projects', label: 'Projects', description: 'Your work, builds, and projects.', icon: FolderKanban },
  { href: '/dashboard/portfolio/education', label: 'Education', description: 'Schools, degrees, and fields of study.', icon: GraduationCap },
  { href: '/dashboard/portfolio/experience', label: 'Experience', description: 'Internships, jobs, and organizations.', icon: Briefcase },
  { href: '/dashboard/portfolio/skills', label: 'Skills', description: 'Technologies and abilities.', icon: Wrench },
  { href: '/dashboard/portfolio/social', label: 'Social links', description: 'GitHub, LinkedIn, and more.', icon: Link2 },
]

export default async function PortfolioHubPage() {
  const user = await requireUser()
  const [projectCount, educationCount, experienceCount, skillCount, socialCount] = await Promise.all([
    db.project.count({ where: { userId: user.id } }),
    db.education.count({ where: { userId: user.id } }),
    db.experience.count({ where: { userId: user.id } }),
    db.skill.count({ where: { userId: user.id } }),
    db.socialLink.count({ where: { userId: user.id } }),
  ])
  const counts = [projectCount, educationCount, experienceCount, skillCount, socialCount]

  return (
    <div>
      <PageHeader
        title="Portfolio"
        description="Everything on your public portfolio, in one place."
        action={<LinkButton href="/dashboard/portfolio/projects/new">Add project</LinkButton>}
      />
      <ul className="space-y-3">
        {sections.map((section, index) => (
          <li key={section.href}>
            <Link
              href={section.href}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-muted"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface-strong text-foreground">
                <section.icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {section.label}
                  <span className="rounded-full bg-surface-strong px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {counts[index]}
                  </span>
                </span>
                <span className="block text-sm text-muted-foreground">{section.description}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
