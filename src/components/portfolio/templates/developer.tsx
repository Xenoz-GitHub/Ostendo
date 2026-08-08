import { ArrowUpRight, ExternalLink as ExternalLinkIcon } from 'lucide-react'
import type { PortfolioData } from '@/lib/portfolio'
import type { SectionColumns, SectionId } from '@/lib/design'
import { EditableText } from '@/components/editor/inline-edit'
import {
  Avatar,
  ContactSection,
  ExternalLink as ExtLink,
  GitHubIcon,
  groupSections,
  HeaderCta,
  parseSocialHref,
  sectionCardClass,
  sectionGridClass,
  SkillPill,
  SocialIcon,
  visibleSections,
} from './shared'
import { cn, formatYearRange } from '@/lib/utils'

const TITLES: Record<SectionId, string> = {
  projects: '// Projects',
  experience: '// Experience',
  skills: '// Skills',
  education: '// Education',
  contact: '// Contact',
}

export default function DeveloperTemplate({ data }: { data: PortfolioData }) {
  const groups = groupSections(visibleSections(data.design))
  const columnsOf = (id: SectionId): SectionColumns =>
    data.design.sections.find((s) => s.id === id)?.columns ?? 1

  return (
    <div className="bg-background text-foreground">
      <header id="site-header" className="border-b border-border bg-surface">
        <div className="pf-container-5xl mx-auto flex w-full flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-5">
            <Avatar src={data.avatarUrl} name={data.name} size="lg" className="ring-1 ring-border" />
            <div>
              <EditableText as="h1" field="name" text={data.name} className="text-2xl font-bold tracking-tight sm:text-3xl" />
              <EditableText
                as="p"
                field="headline"
                text={data.headline}
                className="mt-1 text-muted-foreground"
              />
              <EditableText
                as="p"
                field="bio"
                multiline
                text={data.bio}
                className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground"
              />
              <div className="mt-5">
                <HeaderCta data={data} />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground md:items-end">
            {data.location && <p>{data.location}</p>}
            {data.university && (
              <p>
                {data.university}
                {data.major ? ` · ${data.major}` : ''}
              </p>
            )}
            {data.contactEmail && (
              <a href={`mailto:${data.contactEmail}`} className="hover:text-foreground hover:underline">
                {data.contactEmail}
              </a>
            )}
            <div className="mt-3 flex flex-wrap gap-2 md:justify-end">
              {data.socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={parseSocialHref(link.type, link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label ?? link.type.toLowerCase()}
                  className="pf-btn flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                >
                  <SocialIcon type={link.type} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="pf-container-5xl mx-auto w-full px-5 sm:px-8">
        {groups.map((group) =>
          Array.isArray(group) ? (
            <div key={group.join('-')} className="grid gap-12 md:grid-cols-2">
              {group.map((id) => (
                <DeveloperSection key={id} id={id} title={TITLES[id]}>
                  {renderSection(data, id, columnsOf(id))}
                </DeveloperSection>
              ))}
            </div>
          ) : (
            <DeveloperSection key={group} id={group} title={TITLES[group]}>
              {renderSection(data, group, columnsOf(group))}
            </DeveloperSection>
          )
        )}
      </main>

      <footer className="border-t border-border py-8">
        <div className="pf-container-5xl mx-auto flex w-full items-center justify-between px-5 text-sm text-muted-foreground sm:px-8">
          <p>© {new Date().getFullYear()} {data.name}</p>
          <ExtLink href={`/${data.username}`}>
            <ExternalLinkIcon className="size-4" />
            /{data.username}
          </ExtLink>
        </div>
      </footer>
    </div>
  )
}

function DeveloperSection({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="pf-section">
      <h2 id={`${id}-heading`} className="mb-6 font-mono text-sm font-medium uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}

function renderSection(data: PortfolioData, id: SectionId, columns: SectionColumns) {
  switch (id) {
    case 'projects':
      return <ProjectsSection data={data} columns={columns} />
    case 'experience':
      return <ExperienceSection data={data} columns={columns} />
    case 'education':
      return <EducationSection data={data} columns={columns} />
    case 'skills':
      return <SkillsSection data={data} columns={columns} />
    case 'contact':
      return <ContactSection data={data} />
  }
}

function ProjectsSection({ data, columns }: { data: PortfolioData; columns: SectionColumns }) {
  return (
    <ul className={cn('grid gap-5', columns > 2 && 'sm:grid-cols-2 lg:grid-cols-3', columns === 2 && 'sm:grid-cols-2')}>
      {data.projects.map((project) => (
        <li
          key={project.id}
          className="flex flex-col rounded-lg border border-border bg-surface p-5 transition-shadow hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold">{project.name}</h3>
            <span className="flex shrink-0 gap-1">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub repository"
                  className="pf-btn flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-strong hover:text-foreground"
                >
                  <GitHubIcon className="size-4" />
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Live demo"
                  className="pf-btn flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-strong hover:text-foreground"
                >
                  <ArrowUpRight className="size-4" />
                </a>
              )}
            </span>
          </div>
          {project.description && (
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
          )}
          {project.technologies.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.technologies.map((tech) => (
                <SkillPill key={tech} name={tech} />
              ))}
            </div>
          )}
          {project.date && <p className="mt-3 text-xs text-muted-foreground">{project.date}</p>}
        </li>
      ))}
    </ul>
  )
}

function ExperienceSection({ data, columns }: { data: PortfolioData; columns: SectionColumns }) {
  if (columns === 1) {
    return (
      <ul className="space-y-8 border-l border-border pl-6">
        {data.experience.map((item) => (
          <li key={item.id} className="relative">
            <span aria-hidden className="absolute -left-[29px] top-1.5 size-2.5 rounded-full border-2 border-border-strong bg-background" />
            <h3 className="font-semibold">{item.position}</h3>
            <p className="text-sm text-muted-foreground">{item.organization}</p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {formatRange(item.startMonth, item.startYear, item.endMonth, item.endYear, item.current)}
            </p>
            {item.description && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            )}
          </li>
        ))}
      </ul>
    )
  }
  return (
    <ul className={sectionGridClass(columns)}>
      {data.experience.map((item) => (
        <li key={item.id} className={sectionCardClass(columns)}>
          <p className="font-mono text-xs text-muted-foreground">
            {formatRange(item.startMonth, item.startYear, item.endMonth, item.endYear, item.current)}
          </p>
          <h3 className="mt-1 font-semibold">{item.position}</h3>
          <p className="text-sm text-muted-foreground">{item.organization}</p>
          {item.description && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          )}
        </li>
      ))}
    </ul>
  )
}

function EducationSection({ data, columns }: { data: PortfolioData; columns: SectionColumns }) {
  return (
    <ul className={sectionGridClass(columns)}>
      {data.education.map((item) => (
        <li key={item.id} className={sectionCardClass(columns, 'p-4')}>
          <h3 className="font-semibold">
            {item.degree ? item.degree : 'Education'}
            {item.field ? ` in ${item.field}` : ''}
          </h3>
          <p className="text-sm text-muted-foreground">{item.institution}</p>
          {formatYearRange(item.startYear, item.endYear) && (
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {formatYearRange(item.startYear, item.endYear)}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

function SkillsSection({ data, columns }: { data: PortfolioData; columns: SectionColumns }) {
  if (columns === 1) {
    return (
      <div className="flex flex-wrap gap-2">
        {data.skills.map((skill) => (
          <SkillPill key={skill} name={skill} accent />
        ))}
      </div>
    )
  }
  return (
    <ul className={sectionGridClass(columns)}>
      {data.skills.map((skill) => (
        <li key={skill}>
          <SkillPill name={skill} accent className="w-full justify-center" />
        </li>
      ))}
    </ul>
  )
}

function formatRange(
  startMonth: string | null,
  startYear: number | null,
  endMonth: string | null,
  endYear: number | null,
  current: boolean
): string {
  const parts: string[] = []
  if (startMonth) parts.push(startMonth)
  if (startYear) parts.push(String(startYear))
  const start = parts.join(' ')
  const end = current ? 'Present' : [endMonth, endYear].filter(Boolean).join(' ')
  if (start && end) return `${start} – ${end}`
  return [start, end].filter(Boolean).join(' – ')
}
