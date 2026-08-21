import 'server-only'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { parseDesign, type DesignState } from '@/lib/design'

export type TemplateId = 'MINIMAL' | 'DEVELOPER' | 'CREATIVE'

export type ProjectItem = {
  id: string
  name: string
  description: string | null
  coverImageUrl: string | null
  technologies: string[]
  githubUrl: string | null
  demoUrl: string | null
  date: string | null
  role: string | null
  featured: boolean
}

export type EducationItem = {
  id: string
  institution: string
  degree: string | null
  field: string | null
  startYear: number | null
  endYear: number | null
  description: string | null
}

export type ExperienceItem = {
  id: string
  organization: string
  position: string
  description: string | null
  startMonth: string | null
  startYear: number | null
  endMonth: string | null
  endYear: number | null
  current: boolean
}

export type SocialLinkItem = {
  id: string
  type: 'GITHUB' | 'LINKEDIN' | 'INSTAGRAM' | 'X' | 'YOUTUBE' | 'EMAIL' | 'WEBSITE' | 'OTHER'
  url: string
  label: string | null
}

export type PortfolioData = {
  username: string
  name: string
  avatarUrl: string | null
  headline: string | null
  bio: string | null
  university: string | null
  major: string | null
  graduationYear: number | null
  location: string | null
  contactEmail: string | null
  websiteUrl: string | null
  projects: ProjectItem[]
  education: EducationItem[]
  experience: ExperienceItem[]
  skills: string[]
  socialLinks: SocialLinkItem[]
  template: TemplateId
  design: DesignState
  updatedAt: Date
}

type PortfolioRow = {
  username: string | null
  name: string | null
  avatarUrl: string | null
  emailVerifiedAt: Date | null
  profile: {
    headline: string | null
    bio: string | null
    university: string | null
    major: string | null
    graduationYear: number | null
    location: string | null
    contactEmail: string | null
    websiteUrl: string | null
  } | null
  projects: {
    id: string
    name: string
    description: string | null
    coverImageUrl: string | null
    technologies: unknown
    githubUrl: string | null
    demoUrl: string | null
    date: string | null
    role: string | null
    featured: boolean
  }[]
  education: {
    id: string
    institution: string
    degree: string | null
    field: string | null
    startYear: number | null
    endYear: number | null
    description: string | null
  }[]
  experience: {
    id: string
    organization: string
    position: string
    description: string | null
    startMonth: string | null
    startYear: number | null
    endMonth: string | null
    endYear: number | null
    current: boolean
  }[]
  skills: { id: string; name: string }[]
  socialLinks: { id: string; type: PortfolioData['socialLinks'][number]['type']; url: string; label: string | null }[]
  portfolio: { template: TemplateId; design: unknown; designPublished: unknown; updatedAt: Date } | null
}

function toPortfolioData(row: PortfolioRow, design: DesignState): PortfolioData | null {
  if (!row.username) return null
  return {
    username: row.username,
    name: row.name ?? 'Unnamed',
    avatarUrl: row.avatarUrl,
    headline: row.profile?.headline ?? null,
    bio: row.profile?.bio ?? null,
    university: row.profile?.university ?? null,
    major: row.profile?.major ?? null,
    graduationYear: row.profile?.graduationYear ?? null,
    location: row.profile?.location ?? null,
    contactEmail: row.profile?.contactEmail ?? null,
    websiteUrl: row.profile?.websiteUrl ?? null,
    projects: row.projects
      .map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        coverImageUrl: p.coverImageUrl,
        technologies: Array.isArray(p.technologies) ? (p.technologies as string[]) : [],
        githubUrl: p.githubUrl,
        demoUrl: p.demoUrl,
        date: p.date,
        role: p.role,
        featured: p.featured,
      }))
      .sort((a, b) => Number(b.featured) - Number(a.featured)),
    education: row.education,
    experience: row.experience,
    skills: row.skills.map((s) => s.name),
    socialLinks: row.socialLinks.filter((s) => s.url.trim().length > 0),
    template: row.portfolio?.template ?? 'MINIMAL',
    design,
    updatedAt: row.portfolio?.updatedAt ?? new Date(0),
  }
}

/** Owner's working view: the draft design. */
function toDraftPortfolioData(row: PortfolioRow): PortfolioData | null {
  return toPortfolioData(row, parseDesign(row.portfolio?.design))
}

/** Public site: the last published design snapshot, or the draft when none exists yet. */
function toPublishedPortfolioData(row: PortfolioRow): PortfolioData | null {
  return toPortfolioData(row, parseDesign(row.portfolio?.designPublished ?? row.portfolio?.design))
}

const portfolioSelect = {
  username: true,
  name: true,
  avatarUrl: true,
  emailVerifiedAt: true,
  profile: {
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
  },
  projects: {
    select: {
      id: true,
      name: true,
      description: true,
      coverImageUrl: true,
      technologies: true,
      githubUrl: true,
      demoUrl: true,
      date: true,
      role: true,
      featured: true,
    },
    orderBy: [{ featured: 'desc' }, { orderIndex: 'asc' }],
  },
  education: {
    select: {
      id: true,
      institution: true,
      degree: true,
      field: true,
      startYear: true,
      endYear: true,
      description: true,
    },
    orderBy: [{ startYear: 'desc' }, { createdAt: 'asc' }],
  },
  experience: {
    select: {
      id: true,
      organization: true,
      position: true,
      description: true,
      startMonth: true,
      startYear: true,
      endMonth: true,
      endYear: true,
      current: true,
    },
    orderBy: [{ current: 'desc' }, { startYear: 'desc' }, { createdAt: 'asc' }],
  },
  skills: {
    select: { id: true, name: true },
    orderBy: { orderIndex: 'asc' } as const,
  },
  socialLinks: {
    select: { id: true, type: true, url: true, label: true },
    where: { visible: true },
    orderBy: { orderIndex: 'asc' } as const,
  },
  portfolio: {
    select: { template: true, design: true, designPublished: true, published: true, publishedAt: true, updatedAt: true },
  },
} satisfies Prisma.UserSelect

/** Public data for a published portfolio. Returns null when hidden or missing. */
export async function getPublicPortfolioData(username: string): Promise<PortfolioData | null> {
  const user = await db.user.findUnique({
    where: { username },
    select: portfolioSelect,
  })
  if (!user?.portfolio?.published) return null
  return toPublishedPortfolioData(user)
}

/** Data for the owner's own preview, regardless of publish state. */
export async function getOwnPortfolioData(userId: string): Promise<PortfolioData | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: portfolioSelect,
  })
  if (!user) return null
  return toDraftPortfolioData(user)
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const existing = await db.user.findUnique({
    where: { username },
    select: { id: true },
  })
  return !existing
}
