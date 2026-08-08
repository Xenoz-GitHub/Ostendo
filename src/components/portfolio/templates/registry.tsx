import type { ComponentType } from 'react'
import type { PortfolioData, TemplateId } from '@/lib/portfolio'
import { PortfolioRoot } from '@/components/portfolio/design-styles'
import MinimalTemplate from './minimal'
import DeveloperTemplate from './developer'
import CreativeTemplate from './creative'
import EditorialTemplate from './editorial'

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
      <Template data={data} />
    </PortfolioRoot>
  )
}
