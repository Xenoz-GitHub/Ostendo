import { Mail, Globe, Link as LinkIcon, X } from 'lucide-react'
import { cn, initials } from '@/lib/utils'
import type { DesignState, HeaderCta, SectionColumns, SectionId } from '@/lib/design'
import type { PortfolioData, SocialLinkItem } from '@/lib/portfolio'
import { ContactForm } from '@/components/portfolio/contact-form'

/** Grid classes for a section layout: 1 column renders plain, 2-3 render a responsive card grid. */
export function sectionGridClass(columns: SectionColumns): string {
  if (columns === 2) return 'grid gap-5 sm:grid-cols-2'
  if (columns === 3) return 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'
  return ''
}

/** Card treatment applied to each grid cell when the section uses a multi-column layout. */
export function sectionCardClass(columns: SectionColumns, className?: string): string {
  return cn(className, columns > 1 && 'rounded-xl border border-border bg-surface p-5')
}

/** Sections in the order the student chose, filtered to visible ones. */
export function visibleSections(design: DesignState): SectionId[] {
  return design.sections.filter((s) => s.visible).map((s) => s.id)
}

export type SectionGroup = SectionId | [SectionId, SectionId]

/** Pairs adjacent education + skills sections so templates can render them as a grid. */
export function groupSections(sections: SectionId[]): SectionGroup[] {
  const isPair = (a: SectionId, b: SectionId) =>
    (a === 'education' && b === 'skills') || (a === 'skills' && b === 'education')
  const result: SectionGroup[] = []
  for (let i = 0; i < sections.length; i++) {
    const current = sections[i]
    const next = sections[i + 1]
    if (next && isPair(current, next)) {
      result.push([current, next])
      i++
    } else {
      result.push(current)
    }
  }
  return result
}

type BrandIconProps = React.SVGProps<SVGSVGElement> & { className?: string }

export function GitHubIcon(props: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.72.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  )
}

export function LinkedinIcon(props: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  )
}

export function InstagramIcon(props: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  )
}

export function YoutubeIcon(props: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
    </svg>
  )
}

export function SocialIcon({ type, className }: { type: SocialLinkItem['type']; className?: string }) {
  const props = { className: cn('size-4', className), 'aria-hidden': true }
  switch (type) {
    case 'GITHUB':
      return <GitHubIcon {...props} />
    case 'LINKEDIN':
      return <LinkedinIcon {...props} />
    case 'INSTAGRAM':
      return <InstagramIcon {...props} />
    case 'X':
      return <X {...props} />
    case 'YOUTUBE':
      return <YoutubeIcon {...props} />
    case 'EMAIL':
      return <Mail {...props} />
    case 'WEBSITE':
      return <Globe {...props} />
    default:
      return <LinkIcon {...props} />
  }
}

export function Avatar({
  src,
  name,
  size = 'lg',
  className,
}: {
  src: string | null
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const sizes = {
    sm: 'size-9 text-sm',
    md: 'size-12 text-base',
    lg: 'size-16 text-lg',
    xl: 'size-24 text-2xl',
  }
  if (!src) {
    return (
      <span
        aria-hidden
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full bg-surface-strong font-semibold text-foreground',
          sizes[size],
          className
        )}
      >
        {initials(name)}
      </span>
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={cn('shrink-0 rounded-full object-cover', sizes[size], className)} />
}

export function ContactInfo({ data }: { data: PortfolioData }) {
  const items = [
    data.location,
    data.university ? [data.university, data.major].filter(Boolean).join(' · ') : data.major,
    data.contactEmail,
  ].filter(Boolean)

  if (items.length === 0) return null
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <span key={item}>
          {index > 0 && <span className="mx-3 hidden sm:inline text-border-strong">·</span>}
          {item}
        </span>
      ))}
    </div>
  )
}

export function TemplateSection({
  id,
  title,
  children,
  className,
}: {
  id: string
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={cn('pf-container-3xl pf-section mx-auto w-full px-5 sm:px-8', className)}>
      <h2 id={`${id}-heading`} className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function ContactSection({ data }: { data: PortfolioData }) {
  return (
    <div className="mx-auto max-w-xl">
      {data.contactEmail && (
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Prefer email?{' '}
          <a
            href={`mailto:${data.contactEmail}`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {data.contactEmail}
          </a>
        </p>
      )}
      <ContactForm portfolioOwnerId={data.ownerId} />
    </div>
  )
}

export function SkillPill({ name, accent, className }: { name: string; accent?: boolean; className?: string }) {  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-sm',
        accent
          ? 'border-transparent bg-surface-strong text-foreground'
          : 'border-border bg-surface text-foreground',
        className
      )}
    >
      {name}
    </span>
  )
}

export function ExternalLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline',
        className
      )}
    >
      {children}
    </a>
  )
}

export function parseSocialHref(type: SocialLinkItem['type'], url: string): string {
  if (type === 'EMAIL') {
    return url.includes('@') ? `mailto:${url}` : url
  }
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

/**
 * Resolves a smart button action against the student's actual portfolio data.
 * Returns null when the action can't be fulfilled (e.g. no email set).
 */
export function resolveCtaHref(cta: HeaderCta, data: PortfolioData): string | null {
  const action = cta.action
  if (action.type === 'scroll') return `#${action.section}`
  if (action.type === 'email') return data.contactEmail ? `mailto:${data.contactEmail}` : null
  if (action.type === 'url') {
    const url = action.url
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) return url
    return `https://${url}`
  }
  const link = data.socialLinks.find((l) => l.type === action.social)
  if (!link?.url) return null
  return parseSocialHref(link.type, link.url)
}

/** The hero call-to-action button. Smart actions resolve against portfolio data. */
export function HeaderCta({ data }: { data: PortfolioData }) {
  const cta = data.design.header?.cta
  if (!cta) return null
  const href = resolveCtaHref(cta, data)
  if (!href) return null
  return (
    <a
      href={href}
      className="pf-btn pf-btn-cta inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
    >
      {cta.text}
    </a>
  )
}
