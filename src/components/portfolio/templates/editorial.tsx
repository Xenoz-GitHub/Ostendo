import { ArrowUpRight } from 'lucide-react'
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
  projects: 'Work',
  experience: 'Experience',
  skills: 'Skills',
  education: 'Education',
  contact: 'Contact',
}

export default function EditorialTemplate({ data }: { data: PortfolioData }) {
  const groups = groupSections(visibleSections(data.design))
  const columnsOf = (id: SectionId): SectionColumns =>
    data.design.sections.find((s) => s.id === id)?.columns ?? 1

  return (
    <div className="bg-background text-foreground">
      <header id="site-header" className="border-b border-border">
        <div className="pf-container-4xl mx-auto flex w-full flex-col gap-10 px-5 py-16 sm:px-8 md:flex-row md:items-start md:justify-between md:py-24">
          <div className="max-w-2xl">
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Portfolio — {new Date().getFullYear()}
            </p>
            <EditableText
              as="h1"
              field="name"
              text={data.name}
              className="text-4xl font-extrabold tracking-tight sm:text-6xl"
            />
            <EditableText
              as="p"
              field="headline"
              text={data.headline}
              className="mt-3 text-xl text-muted-foreground sm:text-2xl"
            />
            <EditableText
              as="p"
              field="bio"
              multiline
              text={data.bio}
              className="mt-6 max-w-xl leading-relaxed text-muted-foreground"
            />
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <HeaderCta data={data} />
              {data.socialLinks.length > 0 && (
                <div className="flex items-center gap-2">
                  {data.socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={parseSocialHref(link.type, link.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label ?? link.type.toLowerCase()}
                      className="pf-btn flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                    >
                      <SocialIcon type={link.type} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Avatar src={data.avatarUrl} name={data.name} size="xl" className="ring-1 ring-border md:mt-2" />
        </div>
      </header>

      <main>
        {groups.map((group) => {
          if (Array.isArray(group)) {
            return (
              <div key={group.join('-')} className="grid gap-14 md:grid-cols-2">
                {group.map((id) => (
                  <EditorialSection key={id} id={id} title={TITLES[id]} index={sectionIndex(data, id)}>
                    {renderSection(data, id, columnsOf(id))}
                  </EditorialSection>
                ))}
              </div>
            )
          }
          return (
            <EditorialSection key={group} id={group} title={TITLES[group]} index={sectionIndex(data, group)}>
              {renderSection(data, group, columnsOf(group))}
            </EditorialSection>
          )
        })}
      </main>

      <footer className="border-t border-border py-12 text-center">
        <p className="text-sm font-semibold">{data.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.location ? `${data.location} · ` : ''}Built with Ostendo
        </p>
      </footer>
    </div>
  )
}

/** 1-based position of a section among the visible ones, for the editorial index. */
function sectionIndex(data: PortfolioData, id: SectionId): number {
  const visible = visibleSections(data.design)
  const index = visible.indexOf(id)
  return index === -1 ? 0 : index + 1
}

function EditorialSection({
  id,
  title,
  index,
  children,
}: {
  id: string
  title: string
  index: number
  children: React.ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="pf-container-4xl pf-section mx-auto w-full px-5 sm:px-8">
      <div className="mb-8 flex items-baseline gap-4 border-t-2 border-foreground pt-4">
        <span className="font-mono text-xs text-muted-foreground">{String(index).padStart(2, '0')}</span>
        <h2 id={`${id}-heading`} className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </div>
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
  const featured = data.projects.filter((p) => p.featured)
  const projects = featured.length > 0 ? [...featured, ...data.projects.filter((p) => !p.featured)] : data.projects

  if (columns === 1) {
    return (
      <ul>
        {projects.map((project, index) => (
          <li key={project.id} className="group border-b border-border">
            <div className="flex items-start justify-between gap-6 py-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{project.name}</h3>
                {project.role && <p className="mt-0.5 text-sm text-muted-foreground">{project.role}</p>}
                {project.description && (
                  <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">{project.description}</p>
                )}
                {project.technologies.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <SkillPill key={tech} name={tech} />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-3">
                <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                {(project.githubUrl || project.demoUrl) && (
                  <div className="flex items-center gap-3">
                    {project.githubUrl && (
                      <ExtLink href={project.githubUrl} className="pf-btn text-foreground">
                        <GitHubIcon className="size-4" /> Source
                      </ExtLink>
                    )}
                    {project.demoUrl && (
                      <ExtLink href={project.demoUrl} className="pf-btn text-foreground">
                        <ArrowUpRight className="size-4" /> Live demo
                      </ExtLink>
                    )}
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className={sectionGridClass(columns)}>
      {projects.map((project, index) => (
        <li key={project.id} className={cn(sectionCardClass(columns, 'flex flex-col'), 'group')}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold tracking-tight">{project.name}</h3>
            <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
          </div>
          {project.role && <p className="text-sm text-muted-foreground">{project.role}</p>}
          {project.description && (
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
          )}
          {project.technologies.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.technologies.map((tech) => (
                <SkillPill key={tech} name={tech} />
              ))}
            </div>
          )}
          {(project.githubUrl || project.demoUrl) && (
            <div className="mt-4 flex items-center gap-4">
              {project.githubUrl && (
                <ExtLink href={project.githubUrl} className="pf-btn text-foreground">
                  <GitHubIcon className="size-4" /> Source
                </ExtLink>
              )}
              {project.demoUrl && (
                <ExtLink href={project.demoUrl} className="pf-btn text-foreground">
                  <ArrowUpRight className="size-4" /> Live demo
                </ExtLink>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

function ExperienceSection({ data, columns }: { data: PortfolioData; columns: SectionColumns }) {
  if (columns === 1) {
    return (
      <ul className="space-y-8">
        {data.experience.map((item) => (
          <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border pb-6">
            <div>
              <h3 className="text-lg font-bold tracking-tight">{item.position}</h3>
              <p className="text-sm text-muted-foreground">{item.organization}</p>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {item.current ? 'Current' : ''}{' '}
              {formatRange(item.startMonth, item.startYear, item.endMonth, item.endYear, item.current)}
            </span>
            {item.description && (
              <p className="w-full leading-relaxed text-muted-foreground">{item.description}</p>
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
          <span className="font-mono text-xs text-muted-foreground">
            {item.current ? 'Current' : ''}{' '}
            {formatRange(item.startMonth, item.startYear, item.endMonth, item.endYear, item.current)}
          </span>
          <h3 className="mt-1 text-lg font-bold tracking-tight">{item.position}</h3>
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
    <ul className={cn('space-y-7', sectionGridClass(columns))}>
      {data.education.map((item) => (
        <li key={item.id} className={cn(sectionCardClass(columns), columns === 1 && 'border-b border-border pb-6')}>
          <h3 className="text-lg font-bold tracking-tight">
            {item.degree ? item.degree : 'Education'}
            {item.field ? ` in ${item.field}` : ''}
          </h3>
          <p className="text-sm text-muted-foreground">{item.institution}</p>
          {formatYearRange(item.startYear, item.endYear) && (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {formatYearRange(item.startYear, item.endYear)}
            </p>
          )}
          {item.description && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
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
          <SkillPill name={skill} className="w-full justify-center border-border bg-surface" />
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
