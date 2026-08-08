import { ArrowUpRight } from 'lucide-react'
import type { PortfolioData } from '@/lib/portfolio'
import type { SectionColumns, SectionId } from '@/lib/design'
import { EditableText } from '@/components/editor/inline-edit'
import { Avatar, ContactInfo, ContactSection, GitHubIcon, groupSections, HeaderCta, parseSocialHref, sectionCardClass, sectionGridClass, SkillPill, SocialIcon, visibleSections } from './shared'
import { cn, formatYearRange } from '@/lib/utils'

const TITLES: Record<SectionId, string> = {
  projects: 'Selected work',
  experience: 'Experience',
  skills: 'Skills',
  education: 'Education',
  contact: 'Contact',
}

export default function CreativeTemplate({ data }: { data: PortfolioData }) {
  const groups = groupSections(visibleSections(data.design))
  const columnsOf = (id: SectionId): SectionColumns =>
    data.design.sections.find((s) => s.id === id)?.columns ?? 1

  return (
    <div className="bg-background text-foreground">
      <header id="site-header" className="border-b-2 border-foreground bg-accent">
        <div className="pf-container-4xl mx-auto flex w-full flex-col items-center px-5 py-20 text-center sm:px-8">
          <Avatar src={data.avatarUrl} name={data.name} size="xl" className="mb-6 shadow-sm" />
          <EditableText
            as="p"
            field="headline"
            text={data.headline ?? 'Portfolio'}
            className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          />
          <EditableText as="h1" field="name" text={data.name} className="text-4xl font-black tracking-tight sm:text-5xl" />
          <EditableText
            as="p"
            field="bio"
            multiline
            text={data.bio}
            className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground"
          />
          <div className="mt-8">
            <HeaderCta data={data} />
          </div>
          <div className="mt-6">
            <ContactInfo data={data} />
          </div>
          <div className="mt-8 flex items-center gap-2">
            {data.socialLinks.map((link) => (
              <a
                key={link.id}
                href={parseSocialHref(link.type, link.url)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label ?? link.type.toLowerCase()}
                className="pf-btn flex size-11 items-center justify-center rounded-md border-2 border-foreground text-foreground transition-transform hover:-translate-y-0.5"
              >
                <SocialIcon type={link.type} />
              </a>
            ))}
          </div>
        </div>
      </header>

      <main>
        {groups.map((group, index) => {
          const accent = index % 2 === 0
          if (Array.isArray(group)) {
            return (
              <section key={group.join('-')} aria-label={group.map((id) => TITLES[id]).join(' · ')} className={cn('pf-section', accent && 'bg-accent')}>
                <div className="pf-container-4xl mx-auto w-full px-5 sm:px-8">
                  <div className="grid gap-12 md:grid-cols-2">
                    {group.map((id) => (
                      <CreativeSection key={id} id={id} title={TITLES[id]}>
                        {renderSection(data, id, columnsOf(id))}
                      </CreativeSection>
                    ))}
                  </div>
                </div>
              </section>
            )
          }
          return (
            <CreativeSection key={group} id={group} title={TITLES[group]} accent={accent}>
              {renderSection(data, group, columnsOf(group))}
            </CreativeSection>
          )
        })}
      </main>

      <footer className="border-t-2 border-foreground py-10 text-center">
        <p className="text-sm text-muted-foreground">
          {data.name} — Let&apos;s build something together.
        </p>
        {data.contactEmail && (
          <a
            href={`mailto:${data.contactEmail}`}
            className="mt-2 inline-block font-semibold underline-offset-4 hover:underline"
          >
            {data.contactEmail}
          </a>
        )}
      </footer>
    </div>
  )
}

function CreativeSection({
  id,
  title,
  accent,
  children,
}: {
  id: string
  title: string
  accent?: boolean
  children: React.ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={cn('pf-section', accent && 'bg-accent')}>
      <div className="pf-container-4xl mx-auto w-full px-5 sm:px-8">
        <h2 id={`${id}-heading`} className="mb-8 text-2xl font-bold tracking-tight">
          {title}
        </h2>
        {children}
      </div>
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
  const rest = data.projects.filter((p) => !p.featured)

  if (columns === 1) {
    return (
      <ul className="space-y-10">
        {[...featured, ...rest].map((project, index) => (
          <li key={project.id}>
            <article className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="flex-1">
                <p className="font-mono text-xs text-muted-foreground">0{index + 1}</p>
                <h3 className="mt-1 text-2xl font-bold tracking-tight">{project.name}</h3>
                {project.role && <p className="text-sm text-muted-foreground">{project.role}</p>}
                {project.description && (
                  <p className="mt-3 leading-relaxed text-muted-foreground">{project.description}</p>
                )}
                {project.technologies.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <SkillPill key={tech} name={tech} accent />
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-center gap-5">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pf-btn inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                    >
                      <GitHubIcon className="size-4" /> Source
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pf-btn inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                    >
                      <ArrowUpRight className="size-4" /> Visit
                    </a>
                  )}
                </div>
              </div>
              {project.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.coverImageUrl}
                  alt=""
                  className="h-56 w-full rounded-md border-2 border-foreground object-cover md:h-48 md:w-64"
                />
              ) : (
                <div className="flex h-48 w-full items-center justify-center rounded-md border-2 border-foreground bg-background md:w-64">
                  <span className="text-4xl font-black text-muted-foreground">
                    {project.name.slice(0, 1).toUpperCase()}
                  </span>
                </div>
              )}
            </article>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className={sectionGridClass(columns)}>
      {[...featured, ...rest].map((project, index) => (
        <li key={project.id} className={sectionCardClass(columns, 'flex flex-col')}>
          {project.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.coverImageUrl}
              alt=""
              className="h-40 w-full rounded-md border-2 border-foreground object-cover"
            />
          ) : (
            <div className="flex h-40 w-full items-center justify-center rounded-md border-2 border-foreground bg-background">
              <span className="text-3xl font-black text-muted-foreground">{project.name.slice(0, 1).toUpperCase()}</span>
            </div>
          )}
          <div className="mt-4 flex-1">
            <p className="font-mono text-xs text-muted-foreground">0{index + 1}</p>
            <h3 className="mt-1 text-xl font-bold tracking-tight">{project.name}</h3>
            {project.role && <p className="text-sm text-muted-foreground">{project.role}</p>}
            {project.description && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
            )}
            {project.technologies.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <SkillPill key={tech} name={tech} accent />
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center gap-5">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pf-btn inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                >
                  <GitHubIcon className="size-4" /> Source
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pf-btn inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                >
                  <ArrowUpRight className="size-4" /> Visit
                </a>
              )}
            </div>
          </div>
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
          <li key={item.id} className="border-l-2 border-border-strong pl-5">
            <p className="font-mono text-xs text-muted-foreground">
              {formatRange(item.startMonth, item.startYear, item.endMonth, item.endYear, item.current)}
            </p>
            <h3 className="mt-1 text-lg font-bold">{item.position}</h3>
            <p className="text-muted-foreground">{item.organization}</p>
            {item.description && (
              <p className="mt-2 leading-relaxed text-muted-foreground">{item.description}</p>
            )}
          </li>
        ))}
      </ul>
    )
  }
  return (
    <ul className={sectionGridClass(columns)}>
      {data.experience.map((item) => (
        <li key={item.id} className={sectionCardClass(columns, 'border-l-2')}>
          <p className="font-mono text-xs text-muted-foreground">
            {formatRange(item.startMonth, item.startYear, item.endMonth, item.endYear, item.current)}
          </p>
          <h3 className="mt-1 text-lg font-bold">{item.position}</h3>
          <p className="text-muted-foreground">{item.organization}</p>
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
          <h3 className="font-bold">{item.degree ? item.degree : 'Education'}</h3>
          <p className="text-muted-foreground">{item.institution}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {formatYearRange(item.startYear, item.endYear)}
          </p>
        </li>
      ))}
    </ul>
  )
}

function SkillsSection({ data, columns }: { data: PortfolioData; columns: SectionColumns }) {
  if (columns === 1) {
    return (
      <ul className="flex flex-wrap gap-2">
        {data.skills.map((skill) => (
          <li key={skill}>
            <SkillPill name={skill} accent />
          </li>
        ))}
      </ul>
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
