import { lazy, Suspense, type ComponentType } from 'react'
import type { PortfolioData, TemplateId } from '@/lib/portfolio'
import { PortfolioRoot } from '@/components/portfolio/design-styles'

// Lazy load templates for code splitting - reduces initial bundle size
const MinimalTemplate = lazy(() => import('./minimal'))
const DeveloperTemplate = lazy(() => import('./developer'))
const CreativeTemplate = lazy(() => import('./creative'))
const EditorialTemplate = lazy(() => import('./editorial'))

export type TemplateDefinition = {
  id: TemplateId
  name: string
  description: string
  component: ComponentType<{ data: PortfolioData }>
}

export const templates: TemplateDefinition[] = [
  {
    id: 'MINIMAL',
    name: 'Minimal',
    description: 'Clean and professional. Let your work speak.',
    component: MinimalTemplate,
  },
  {
    id: 'DEVELOPER',
    name: 'Developer',
    description: 'Built for engineers. Projects, code, and GitHub front and center.',
    component: DeveloperTemplate,
  },
  {
    id: 'CREATIVE',
    name: 'Creative',
    description: 'Bold and expressive. For visual and creative work.',
    component: CreativeTemplate,
  },
  {
    id: 'EDITORIAL',
    name: 'Editorial',
    description: 'Magazine-inspired. Big type, numbered sections, editorial lists.',
    component: EditorialTemplate,
  },
]

export function getTemplate(id: TemplateId): TemplateDefinition {
  return templates.find((t) => t.id === id) ?? templates[0]
}

export function TemplateRenderer({ data }: { data: PortfolioData }) {
  const Template = getTemplate(data.template).component
  return (
    <PortfolioRoot design={data.design}>
      <Suspense fallback={<TemplateLoadingFallback />}>
        <Template data={data} />
      </Suspense>
    </PortfolioRoot>
  )
}

function TemplateLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-foreground" />
        <p className="text-sm text-muted-foreground">Loading portfolio...</p>
      </div>
    </div>
  )
}
