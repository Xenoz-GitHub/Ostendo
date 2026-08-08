'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { publishDesign, updateDesign } from '@/actions/design'
import {
  DESIGN_COLOR_LABELS,
  SECTION_LABELS,
  bodyFonts,
  designPresets,
  getFontStack,
  headingFonts,
  type DesignColorKey,
  type DesignState,
  type SectionId,
} from '@/lib/design'
import type { PortfolioData } from '@/lib/portfolio'
import { getTemplate } from '@/components/portfolio/templates/registry'
import { PortfolioRoot } from '@/components/portfolio/design-styles'
import { PreviewShell } from '@/components/dashboard/preview-shell'
import { Button } from '@/components/ui'
import { Switch } from '@/components/ui/feedback'
import { Check, ChevronDown, ChevronUp, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLOR_KEYS: DesignColorKey[] = ['primary', 'background', 'text', 'accent']

function isSameDesign(a: DesignState, b: DesignState): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function DesignEditor({
  data,
  initialDesign,
  publishedDesign,
  isPublished,
  hasPublishedDesign,
}: {
  data: PortfolioData
  initialDesign: DesignState
  publishedDesign: DesignState
  isPublished: boolean
  hasPublishedDesign: boolean
}) {
  const router = useRouter()
  const [design, setDesign] = useState<DesignState>(initialDesign)
  const [dirty, setDirty] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishingDesign, setPublishingDesign] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const Template = getTemplate(data.template).component

  const liveDiffers =
    isPublished && hasPublishedDesign && !isSameDesign(initialDesign, publishedDesign)

  function update(mutator: (current: DesignState) => DesignState) {
    setDesign((current) => mutator(current))
    setDirty(true)
    setError(null)
  }

  function moveSection(index: number, delta: number) {
    update((current) => {
      const next = [...current.sections]
      const target = index + delta
      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target], next[index]]
      return { ...current, sections: next }
    })
  }

  async function save() {
    setSaving(true)
    setError(null)
    const result = await updateDesign(design)
    setSaving(false)
    if (!result.ok) {
      setError(result.message ?? 'Something went wrong.')
      return
    }
    setDirty(false)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
    router.refresh()
  }

  async function publishLive() {
    setPublishingDesign(true)
    setError(null)
    const result = await publishDesign()
    setPublishingDesign(false)
    if (!result.ok) {
      setError(result.message ?? 'Something went wrong.')
      return
    }
    router.refresh()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr] lg:items-start">
      <div className="space-y-6">
        {error && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive-muted p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {liveDiffers && (
          <div className="rounded-xl border border-warning/30 bg-warning-muted p-4 text-sm text-warning">
            <p className="flex items-center gap-2 font-medium">
              <Globe className="size-4" aria-hidden /> Your live site still uses a previous design
            </p>
            <p className="mt-1 opacity-90">
              Draft changes show here and in Preview, but visitors keep seeing the published design until you push it live.
            </p>
            <Button variant="primary" size="sm" className="mt-3" loading={publishingDesign} onClick={publishLive}>
              Publish design to live site
            </Button>
          </div>
        )}

        <section aria-labelledby="presets-heading">
          <h2 id="presets-heading" className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Presets
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {designPresets.map((item) => {
              const isSelected = design.preset === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => update((current) => ({ ...current, preset: item.id, palette: item.palette }))}
                  aria-pressed={isSelected}
                  className={cn(
                    'relative rounded-xl border-2 bg-surface p-3 text-left transition-colors',
                    isSelected ? 'border-primary' : 'border-border hover:border-border-strong'
                  )}
                >
                  {isSelected && (
                    <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" aria-hidden />
                    </span>
                  )}
                  <span className="mb-2.5 flex items-center gap-1.5" aria-hidden>
                    {COLOR_KEYS.map((key) => (
                      <span key={key} className="size-5 rounded-md border border-black/10" style={{ backgroundColor: item.palette[key] }} />
                    ))}
                  </span>
                  <span className="block text-sm font-medium">{item.name}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section aria-labelledby="custom-heading">
          <h2 id="custom-heading" className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Custom colors
          </h2>
          <div className="space-y-1 rounded-xl border border-border bg-surface p-3">
            {COLOR_KEYS.map((key) => (
              <ColorField
                key={key}
                label={DESIGN_COLOR_LABELS[key]}
                value={design.palette[key]}
                onChange={(value) =>
                  update((current) => ({ ...current, preset: 'CUSTOM', palette: { ...current.palette, [key]: value } }))
                }
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="typography-heading">
          <h2 id="typography-heading" className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Typography
          </h2>
          <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
            <FontSelect
              label="Body font"
              fonts={bodyFonts}
              value={design.typography.body}
              onChange={(value) => update((current) => ({ ...current, typography: { ...current.typography, body: value as DesignState['typography']['body'] } }))}
            />
            <FontSelect
              label="Heading font"
              fonts={headingFonts}
              value={design.typography.heading}
              onChange={(value) => update((current) => ({ ...current, typography: { ...current.typography, heading: value as DesignState['typography']['heading'] } }))}
            />
          </div>
        </section>

        <section aria-labelledby="layout-heading">
          <h2 id="layout-heading" className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Layout
          </h2>
          <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
            <Segmented
              label="Content width"
              value={design.layout.contentWidth}
              options={[
                { value: 'narrow', label: 'Narrow' },
                { value: 'default', label: 'Default' },
                { value: 'wide', label: 'Wide' },
              ]}
              onChange={(value) => update((current) => ({ ...current, layout: { ...current.layout, contentWidth: value as DesignState['layout']['contentWidth'] } }))}
            />
            <Segmented
              label="Spacing"
              value={design.layout.spacing}
              options={[
                { value: 'compact', label: 'Compact' },
                { value: 'comfortable', label: 'Comfortable' },
                { value: 'spacious', label: 'Spacious' },
              ]}
              onChange={(value) => update((current) => ({ ...current, layout: { ...current.layout, spacing: value as DesignState['layout']['spacing'] } }))}
            />
          </div>
        </section>

        <section aria-labelledby="buttons-heading">
          <h2 id="buttons-heading" className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Buttons
          </h2>
          <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
            <Segmented
              label="Shape"
              value={design.buttons.shape}
              options={[
                { value: 'rounded', label: 'Rounded' },
                { value: 'squarish', label: 'Squarish' },
              ]}
              onChange={(value) => update((current) => ({ ...current, buttons: { ...current.buttons, shape: value as DesignState['buttons']['shape'] } }))}
            />
            <Segmented
              label="Style"
              value={design.buttons.style}
              options={[
                { value: 'outline', label: 'Outline' },
                { value: 'solid', label: 'Solid' },
              ]}
              onChange={(value) => update((current) => ({ ...current, buttons: { ...current.buttons, style: value as DesignState['buttons']['style'] } }))}
            />
          </div>
        </section>

        <section aria-labelledby="sections-heading">
          <h2 id="sections-heading" className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Sections
          </h2>
          <div className="rounded-xl border border-border bg-surface p-3">
            <p className="border-b border-border px-2 pb-2.5 text-xs text-muted-foreground">
              Use the arrows to reorder, toggle to show or hide.
            </p>
            <ul className="divide-y divide-border">
              {design.sections.map((section, index) => (
                <li key={section.id} className="flex items-center gap-1 px-2 py-2.5">
                  <div className="flex flex-col">
                    <ReorderButton
                      direction="up"
                      disabled={index === 0}
                      label={`Move ${SECTION_LABELS[section.id as SectionId]} up`}
                      onClick={() => moveSection(index, -1)}
                    />
                    <ReorderButton
                      direction="down"
                      disabled={index === design.sections.length - 1}
                      label={`Move ${SECTION_LABELS[section.id as SectionId]} down`}
                      onClick={() => moveSection(index, 1)}
                    />
                  </div>
                  <span className="flex-1 text-sm font-medium">{SECTION_LABELS[section.id as SectionId]}</span>
                  <Switch
                    checked={section.visible}
                    label={`Show ${SECTION_LABELS[section.id as SectionId]}`}
                    onChange={(checked) =>
                      update((current) => ({
                        ...current,
                        sections: current.sections.map((s) => (s.id === section.id ? { ...s, visible: checked } : s)),
                      }))
                    }
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <Button onClick={save} loading={saving} disabled={!dirty && !error}>
            {justSaved ? (
              <>
                <Check className="size-4" aria-hidden /> Saved
              </>
            ) : (
              'Save changes'
            )}
          </Button>
          {!dirty && !justSaved && <p className="text-sm text-muted-foreground">Up to date</p>}
        </div>
      </div>

      <PreviewShell>
        <PortfolioRoot design={design}>
          <Template data={data} />
        </PortfolioRoot>
      </PreviewShell>
    </div>
  )
}

function ReorderButton({
  direction,
  disabled,
  label,
  onClick,
}: {
  direction: 'up' | 'down'
  disabled: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex items-center justify-center rounded p-0.5 text-muted-foreground transition-colors',
        disabled ? 'opacity-30' : 'hover:bg-surface-muted hover:text-foreground'
      )}
    >
      {direction === 'up' ? <ChevronUp className="size-3.5" aria-hidden /> : <ChevronDown className="size-3.5" aria-hidden />}
    </button>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3 px-2 py-2">
      <span className="text-sm font-medium">{label}</span>
      <span className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground">{value}</span>
        <span
          className="relative size-9 shrink-0 overflow-hidden rounded-md border border-border-strong"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-label={`${label} color`}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </span>
      </span>
    </label>
  )
}

function FontSelect({
  label,
  fonts,
  value,
  onChange,
}: {
  label: string
  fonts: readonly { id: string; name: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-44 rounded-md border border-border-strong bg-surface px-2 text-sm text-foreground"
      >
        {fonts.map((font) => (
          <option key={font.id} value={font.id} style={font.id === 'system' ? undefined : { fontFamily: getFontStack(font.id) }}>
            {font.name}
          </option>
        ))}
      </select>
    </label>
  )
}

function Segmented({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium">{label}</span>
      <div role="radiogroup" aria-label={label} className="inline-flex items-center rounded-lg border border-border bg-surface-muted p-0.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              value === option.value ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
