import { ArrowUpRight } from 'lucide-react'
import type { PortfolioData } from '@/lib/portfolio'
import type { SectionColumns, SectionId } from '@/lib/design'
import { SECTION_LABELS } from '@/lib/design'
import { EditableText } from '@/components/editor/inline-edit'
import {
  Avatar,
  ContactInfo,
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
  TemplateSection,
  visibleSections,
} from './shared'
import { cn, formatYearRange } from '@/lib/utils'

export default function MinimalTemplate({ data }: { data: PortfolioData }) {
  const groups = groupSections(visibleSections(data.design))
  const columnsOf = (id: SectionId): SectionColumns =>
    data.design.sections.find((s) => s.id === id)?.columns ?? 1

  return (
    <div className="bg-background text-foreground">
      <header id="site-header" className="border-b border-border">
        <div className="pf-container-3xl mx-auto flex w-full flex-col items-center px-5 py-16 text-center sm:px-8">
          <Avatar src={data.avatarUrl} name={data.name} size="xl" className="mb-5 ring-1 ring-border" />
          <EditableText as="h1" field="name" text={data.name} className="text-3xl font-bold tracking-tight sm:text-4xl" />
          <EditableText
            as="p"
            field="headline"
            text={data.headline}
            className="mt-2 text-lg text-muted-foreground"
          />
          <EditableText
            as="p"
            field="bio"
            multiline
            text={data.bio}
            className="mt-5 max-w-xl leading-relaxed text-muted-foreground"
          />
          <div className="mt-6">
            <HeaderCta data={data} />
          </div>
          <div className="mt-6">
            <ContactInfo data={data} />
          </div>
          {data.socialLinks.length > 0 && (
            <div className="mt-6 flex items-center gap-2">
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
      </header>

      <main>
        {groups.map((group, index) => {
          const className = cn(index > 0 && 'border-t border-border')
          if (Array.isArray(group)) {
            return (
              <div key={group.join('-')} className="grid gap-12 md:grid-cols-2">
                {group.map((id) => (
                  <TemplateSection key={id} id={id} title={SECTION_LABELS[id]} className={className}>
                    {renderSection(data, id, columnsOf(id))}
                  </TemplateSection>
                ))}
              </div>
            )
          }
          return (
            <TemplateSection key={group} id={group} title={SECTION_LABELS[group]} className={className}>
              {renderSection(data, group, columnsOf(group))}
            </TemplateSection>
          )
        })}
      </main>

      <footer className="border-t border-border py-10 text-center">
        <p className="text-sm text-muted-foreground">
          {data.name} · {data.username} · {data.location ?? 'Portfolio'}
        </p>
      </footer>
    </div>
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
      <ul className="space-y-6">
        {projects.map((project) => (
          <li key={project.id} className="flex flex-col gap-4 sm:flex-row">
            {project.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.coverImageUrl}
                alt=""
                className="h-40 w-full rounded-lg border border-border object-cover sm:h-28 sm:w-40"
              />
            ) : (
              <div className="flex h-40 w-full shrink-0 items-center justify-center rounded-lg border border-border bg-surface sm:h-28 sm:w-40">
                <span className="text-sm font-medium text-muted-foreground">{project.name.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
            <div className="flex-1">
              <ProjectMeta project={project} />
            </div>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className={sectionGridClass(columns)}>
      {projects.map((project) => (
        <li key={project.id} className={sectionCardClass(columns, 'flex flex-col')}>
          {project.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.coverImageUrl}
              alt=""
              className="h-36 w-full rounded-lg border border-border object-cover"
            />
          ) : (
            <div className="flex h-36 w-full items-center justify-center rounded-lg border border-border bg-surface">
              <span className="text-sm font-medium text-muted-foreground">{project.name.slice(0, 2).toUpperCase()}</span>
            </div>
          )}
          <div className="mt-4 flex-1">
            <ProjectMeta project={project} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function ProjectMeta({ project }: { project: PortfolioData['projects'][number] }) {
  return (
    <>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-semibold">{project.name}</h3>
        {project.date && <span className="text-sm text-muted-foreground">{project.date}</span>}
      </div>
      {project.description && (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
      )}
      {project.technologies.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {project.technologies.map((tech) => (
            <SkillPill key={tech} name={tech} />
          ))}
        </div>
      )}
      {(project.githubUrl || project.demoUrl) && (
        <div className="mt-3 flex items-center gap-4">
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
    </>
  )
}

function ExperienceSection({ data, columns }: { data: PortfolioData; columns: SectionColumns }) {
  if (columns === 1) {
    return (
      <ul className="space-y-7">
        {data.experience.map((item) => (
          <li key={item.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-semibold">{item.position}</h3>
              <span className="text-sm text-muted-foreground">
                {item.current ? 'Current' : ''}{' '}
                {formatRange(item.startMonth, item.startYear, item.endMonth, item.endYear, item.current)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{item.organization}</p>
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
          <span className="text-xs text-muted-foreground">
            {item.current ? 'Current' : ''}{' '}
            {formatRange(item.startMonth, item.startYear, item.endMonth, item.endYear, item.current)}
          </span>
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
    <ul className={cn('space-y-6', sectionGridClass(columns))}>
      {data.education.map((item) => (
        <li key={item.id} className={sectionCardClass(columns)}>
          <h3 className="font-semibold">
            {item.degree ? item.degree : 'Education'}
            {item.field ? ` in ${item.field}` : ''}
          </h3>
          <p className="text-sm text-muted-foreground">{item.institution}</p>
          {formatYearRange(item.startYear, item.endYear) && (
            <p className="mt-1 text-sm text-muted-foreground">{formatYearRange(item.startYear, item.endYear)}</p>
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
          <SkillPill key={skill} name={skill} />
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
