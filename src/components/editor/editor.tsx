'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { publishDesign, updateStructure } from '@/actions/design'
import { updateProfileField, type InlineEditKey } from '@/actions/profile'
import { EditableProvider } from '@/components/editor/inline-edit'
import {
  CTA_SOCIAL_LABELS,
  CTA_SOCIAL_TYPES,
  SECTION_IDS,
  SECTION_LABELS,
  defaultColumnsFor,
  type DesignState,
  type HeaderCta,
  type SectionColumns,
  type SectionId,
} from '@/lib/design'
import type { PortfolioData } from '@/lib/portfolio'
import { getTemplate } from '@/components/portfolio/templates/registry'
import { PortfolioRoot } from '@/components/portfolio/design-styles'
import { LinkButton } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui'
import { Switch } from '@/components/ui/feedback'
import { cn } from '@/lib/utils'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Globe,
  GripVertical,
  Monitor,
  MonitorSmartphone,
  Palette,
  Plus,
  Redo2,
  Tablet,
  Undo2,
} from 'lucide-react'

type Sections = DesignState['sections']
type Device = 'desktop' | 'tablet' | 'mobile'
type SelectableId = SectionId | 'header'
type Rect = { top: number; left: number; width: number; height: number }

const TEMPLATE_LABELS: Record<string, string> = {
  MINIMAL: 'Minimal',
  DEVELOPER: 'Developer',
  CREATIVE: 'Creative',
}

const COLUMN_OPTIONS: SectionColumns[] = [1, 2, 3]

const HISTORY_KEY = 'ostendo:editor:history'

type EditorHistory = {
  sections: Sections
  cta: HeaderCta | null | undefined
  past: Sections[]
  future: Sections[]
}

/** Validates a stored section list. Returns null when the shape is corrupt. */
function sanitizeSectionsList(value: unknown): Sections | null {
  if (!Array.isArray(value) || value.length === 0) return null
  const seen = new Set<SectionId>()
  const sections: Sections = []
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') return null
    const { id, visible, columns } = entry as { id?: unknown; visible?: unknown; columns?: unknown }
    if (typeof id !== 'string' || !SECTION_IDS.includes(id as SectionId) || seen.has(id as SectionId)) return null
    seen.add(id as SectionId)
    sections.push({
      id: id as SectionId,
      visible: visible !== false,
      columns: columns === 1 || columns === 2 || columns === 3 ? columns : defaultColumnsFor(id as SectionId),
    })
  }
  if (seen.size !== SECTION_IDS.length) return null
  return sections
}

/** Validates a stored header button. Undefined means "invalid, use the server value". */
function sanitizeCta(value: unknown): HeaderCta | null | undefined {
  if (value === null) return null
  if (value === undefined || typeof value !== 'object') return undefined
  const { text, action } = value as { text?: unknown; action?: unknown }
  if (typeof text !== 'string' || !text.trim() || text.length > 40) return undefined
  if (!action || typeof action !== 'object') return undefined
  const candidate = action as { type?: unknown; section?: unknown; url?: unknown; social?: unknown }
  if (candidate.type === 'scroll') {
    if (typeof candidate.section !== 'string' || !SECTION_IDS.includes(candidate.section as SectionId)) return undefined
    return { text: text.trim(), action: { type: 'scroll', section: candidate.section as SectionId } }
  }
  if (candidate.type === 'url') {
    if (typeof candidate.url !== 'string') return undefined
    return { text: text.trim(), action: { type: 'url', url: candidate.url } }
  }
  if (candidate.type === 'email') return { text: text.trim(), action: { type: 'email' } }
  if (candidate.type === 'social') {
    if (typeof candidate.social !== 'string' || !CTA_SOCIAL_TYPES.includes(candidate.social as (typeof CTA_SOCIAL_TYPES)[number])) {
      return undefined
    }
    return { text: text.trim(), action: { type: 'social', social: candidate.social as (typeof CTA_SOCIAL_TYPES)[number] } }
  }
  return undefined
}

function readEditorHistory(): EditorHistory | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(HISTORY_KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as { sections?: unknown; cta?: unknown; past?: unknown; future?: unknown }
    const sections = sanitizeSectionsList(value.sections)
    if (!sections) return null
    const sanitizeStack = (stack: unknown): Sections[] => {
      if (!Array.isArray(stack)) return []
      return stack
        .slice(-50)
        .map((entry) => sanitizeSectionsList(entry))
        .filter((entry): entry is Sections => entry !== null)
    }
    return {
      sections,
      cta: sanitizeCta(value.cta),
      past: sanitizeStack(value.past),
      future: sanitizeStack(value.future),
    }
  } catch {
    return null
  }
}

function writeEditorHistory(history: EditorHistory) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch {
    // Session storage may be unavailable (private mode, quota); editing still works in-memory.
  }
}

function clearEditorHistory() {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(HISTORY_KEY)
  } catch {
    // Ignore.
  }
}

const SECTION_DESCRIPTIONS: Record<SectionId, string> = {
  projects: 'A showcase of your project work',
  experience: 'Your work history as a timeline',
  skills: 'Your skills as tags',
  education: 'Your degrees and institutions',
  contact: 'A form visitors use to send you a message',
}

const CONTENT_LINKS: Partial<Record<SectionId, string>> = {
  projects: '/dashboard/portfolio/projects',
  experience: '/dashboard/portfolio/experience',
  skills: '/dashboard/portfolio/skills',
  education: '/dashboard/portfolio/education',
}

const DEVICES: { id: Device; label: string; icon: typeof Monitor }[] = [
  { id: 'desktop', label: 'Desktop', icon: Monitor },
  { id: 'tablet', label: 'Tablet', icon: Tablet },
  { id: 'mobile', label: 'Phone', icon: MonitorSmartphone },
]

const DEVICE_WIDTHS: Record<Device, string> = {
  desktop: 'w-full',
  tablet: 'w-[768px]',
  mobile: 'w-[390px]',
}

export function Editor({
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
  const restoredRef = useRef<EditorHistory | null>(null)
  if (restoredRef.current === null) restoredRef.current = readEditorHistory()
  const restored = restoredRef.current
  const restoredCta = restored ? restored.cta : undefined
  const [sections, setSections] = useState<Sections>(restored?.sections ?? initialDesign.sections)
  const [cta, setCta] = useState<HeaderCta | null>(restoredCta !== undefined ? restoredCta : initialDesign.header.cta)
  const [past, setPast] = useState<Sections[]>(restored?.past ?? [])
  const [future, setFuture] = useState<Sections[]>(restored?.future ?? [])
  const [selected, setSelected] = useState<SelectableId | null>(null)
  const [device, setDevice] = useState<Device>('desktop')
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [rects, setRects] = useState<Partial<Record<SelectableId, Rect>>>({})
  const [dragId, setDragId] = useState<SectionId | null>(null)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [publishingDesign, setPublishingDesign] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<Partial<Record<InlineEditKey, string>>>({})

  const frameRef = useRef<HTMLDivElement>(null)
  const dragIdRef = useRef<SectionId | null>(null)

  const Template = getTemplate(data.template).component
  const canvasDesign: DesignState = { ...initialDesign, sections, header: { cta } }

  async function handleInlineEdit(field: InlineEditKey, value: string) {
    setOverrides((prev) => ({ ...prev, [field]: value }))
    setError(null)
    const result = await updateProfileField(field, value)
    if (!result.ok) {
      setError(result.message ?? 'Could not save your change.')
      return
    }
    router.refresh()
  }

  const dirty =
    JSON.stringify(sections) !== JSON.stringify(initialDesign.sections) ||
    JSON.stringify(cta) !== JSON.stringify(initialDesign.header.cta)
  const liveDiffers =
    isPublished && hasPublishedDesign && JSON.stringify(initialDesign) !== JSON.stringify(publishedDesign)

  const measure = useCallback(() => {
    const frame = frameRef.current
    if (!frame) return
    const frameRect = frame.getBoundingClientRect()
    const next: Partial<Record<SelectableId, Rect>> = {}
    const measureElement = (id: SelectableId, selector: string) => {
      const el = frame.querySelector(selector)
      if (!el) return
      const r = el.getBoundingClientRect()
      next[id] = { top: r.top - frameRect.top, left: r.left - frameRect.left, width: r.width, height: r.height }
    }
    measureElement('header', 'header[id]')
    for (const id of SECTION_IDS) measureElement(id, `#${id}`)
    setRects(next)
  }, [])

  useLayoutEffect(() => {
    measure()
    const frame = frameRef.current
    if (!frame) return
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    frame.querySelectorAll('section[id], header[id]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [measure, sections, device, data, cta])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, select')) return
      const key = event.key.toLowerCase()
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
      } else if (key === 'z' && event.shiftKey) {
        event.preventDefault()
        redo()
      } else if (key === 'y') {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  useEffect(() => {
    writeEditorHistory({ sections, cta, past, future })
  }, [sections, cta, past, future])

  function commit(next: Sections) {
    setPast((p) => [...p.slice(-49), sections])
    setFuture([])
    setSections(next)
  }

  function undo() {
    if (past.length === 0) return
    setFuture((f) => [...f, sections])
    setSections(past[past.length - 1])
    setPast((p) => p.slice(0, -1))
  }

  function redo() {
    if (future.length === 0) return
    setPast((p) => [...p, sections])
    setSections(future[future.length - 1])
    setFuture((f) => f.slice(0, -1))
  }

  function moveSection(id: SectionId, toIndex: number) {
    const from = sections.findIndex((s) => s.id === id)
    if (from === -1 || toIndex === from || toIndex < 0 || toIndex >= sections.length) return
    const next = [...sections]
    const [item] = next.splice(from, 1)
    next.splice(toIndex, 0, item)
    commit(next)
  }

  function moveBy(id: SectionId, delta: number) {
    moveSection(id, sections.findIndex((s) => s.id === id) + delta)
  }

  function toggleVisible(id: SectionId) {
    commit(sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)))
  }

  function addSection(id: SectionId) {
    setShowAddMenu(false)
    const anchor = selected ? sections.findIndex((s) => s.id === selected) : -1
    const insertAt = anchor === -1 ? sections.length : anchor + 1
    const existing = sections.find((s) => s.id === id)
    const next = sections.filter((s) => s.id !== id)
    let target = insertAt
    if (anchor !== -1 && existing) {
      const existingIndex = sections.findIndex((s) => s.id === id)
      if (existingIndex < insertAt) target -= 1
    }
    next.splice(Math.max(0, Math.min(target, next.length)), 0, { id, visible: true, columns: defaultColumnsFor(id) })
    commit(next)
    setSelected(id)
  }

  function setColumnsFor(id: SectionId, columns: SectionColumns) {
    commit(sections.map((s) => (s.id === id ? { ...s, columns } : s)))
  }

  async function save() {
    setSaving(true)
    setError(null)
    const result = await updateStructure({ sections, header: { cta } })
    setSaving(false)
    if (!result.ok) {
      setError(result.message ?? 'Something went wrong.')
      return
    }
    setPast([])
    setFuture([])
    clearEditorHistory()
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

  const selectedIndex = selected && selected !== 'header' ? sections.findIndex((s) => s.id === selected) : -1
  const selectedSection = selected && selected !== 'header' ? sections[selectedIndex] : null

  return (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive-muted p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
          <ToolbarIconButton label="Undo" disabled={past.length === 0} onClick={undo}>
            <Undo2 className="size-4" aria-hidden />
          </ToolbarIconButton>
          <ToolbarIconButton label="Redo" disabled={future.length === 0} onClick={redo}>
            <Redo2 className="size-4" aria-hidden />
          </ToolbarIconButton>
        </div>

        <div role="radiogroup" aria-label="Preview device" className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
          {DEVICES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={device === item.id}
              onClick={() => setDevice(item.id)}
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors',
                device === item.id ? 'bg-surface-strong text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="size-4" aria-hidden />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {liveDiffers ? (
            <Button variant="outline" loading={publishingDesign} onClick={publishLive}>
              <Globe className="size-4" aria-hidden /> Publish changes
            </Button>
          ) : isPublished ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
              <Check className="size-4" aria-hidden /> Live
            </span>
          ) : (
            <p className="text-sm text-muted-foreground">
              Draft mode — publish your site on the{' '}
              <Link href="/dashboard/template" className="font-medium underline underline-offset-2">
                Template
              </Link>{' '}
              page.
            </p>
          )}
          <Button onClick={save} loading={saving} disabled={!dirty}>
            {justSaved ? (
              <>
                <Check className="size-4" aria-hidden /> Saved
              </>
            ) : (
              'Save draft'
            )}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <section aria-labelledby="sections-heading">
            <h2 id="sections-heading" className="mb-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Sections
            </h2>
            <div className="rounded-xl border border-border bg-surface">
              <Button
                variant="secondary"
                className="w-full justify-between rounded-none rounded-t-xl"
                onClick={() => setShowAddMenu((v) => !v)}
                aria-expanded={showAddMenu}
              >
                <span className="inline-flex items-center gap-2">
                  <Plus className="size-4" aria-hidden /> Add section
                </span>
                <ChevronDown className={cn('size-4 transition-transform', showAddMenu && 'rotate-180')} aria-hidden />
              </Button>
              {showAddMenu && (
                <ul className="border-t border-border p-1.5">
                  {SECTION_IDS.map((id) => (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => addSection(id)}
                        className="w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-muted"
                      >
                        <span className="block text-sm font-medium">{SECTION_LABELS[id]}</span>
                        <span className="block text-xs text-muted-foreground">{SECTION_DESCRIPTIONS[id]}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <ul className="border-t border-border divide-y divide-border">
                {sections.map((section, index) => (
                  <li
                    key={section.id}
                    draggable
                    onDragStart={(event) => {
                      dragIdRef.current = section.id
                      setDragId(section.id)
                      event.dataTransfer.effectAllowed = 'move'
                      event.dataTransfer.setData('text/plain', section.id)
                    }}
                    onDragEnd={() => {
                      dragIdRef.current = null
                      setDragId(null)
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDragEnter={(event) => {
                      event.preventDefault()
                      const dragged = dragIdRef.current
                      if (dragged && dragged !== section.id) moveSection(dragged, index)
                    }}
                    className={cn('flex items-center gap-1 px-2 py-2', dragId === section.id && 'opacity-50')}
                  >
                    <span aria-hidden className="cursor-grab p-1 text-muted-foreground">
                      <GripVertical className="size-4" />
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelected(section.id)}
                      className={cn(
                        'flex-1 rounded-md px-2 py-1 text-left text-sm font-medium transition-colors',
                        selected === section.id ? 'bg-surface-muted' : 'hover:bg-surface-muted/60',
                        !section.visible && 'text-muted-foreground line-through'
                      )}
                    >
                      {SECTION_LABELS[section.id]}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleVisible(section.id)}
                      aria-label={`${section.visible ? 'Hide' : 'Show'} ${SECTION_LABELS[section.id]} section`}
                      className={cn('rounded-md p-1.5 transition-colors hover:bg-surface-muted', section.visible ? 'text-muted-foreground' : 'text-foreground')}
                    >
                      {section.visible ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section aria-labelledby="properties-heading">
            <h2 id="properties-heading" className="mb-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Properties
            </h2>
            {selected === 'header' ? (
              <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">Header</h3>
                  <span className="text-xs text-muted-foreground">Hero area</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show button</span>
                  <Switch
                    checked={cta !== null}
                    label="Show header button"
                    onChange={(checked) =>
                      setCta(checked ? { text: 'View my work', action: { type: 'scroll', section: 'projects' } } : null)
                    }
                  />
                </div>
                {cta && (
                  <>
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-muted-foreground">Button text</span>
                      <input
                        type="text"
                        value={cta.text}
                        maxLength={40}
                        onChange={(event) => setCta({ ...cta, text: event.target.value })}
                        className="h-9 w-full rounded-md border border-border-strong bg-surface px-2 text-sm text-foreground"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-muted-foreground">Action</span>
                      <select
                        value={cta.action.type}
                        onChange={(event) => setCta({ ...cta, action: defaultActionFor(event.target.value) })}
                        className="h-9 w-full rounded-md border border-border-strong bg-surface px-2 text-sm text-foreground"
                      >
                        <option value="scroll">Scroll to section</option>
                        <option value="url">Open URL</option>
                        <option value="email">Send email</option>
                        <option value="social">Open social profile</option>
                      </select>
                    </label>
                    {cta.action.type === 'scroll' && (
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-muted-foreground">Target section</span>
                        <select
                          value={cta.action.section}
                          onChange={(event) => setCta({ ...cta, action: { type: 'scroll', section: event.target.value as SectionId } })}
                          className="h-9 w-full rounded-md border border-border-strong bg-surface px-2 text-sm text-foreground"
                        >
                          {SECTION_IDS.map((id) => (
                            <option key={id} value={id}>
                              {SECTION_LABELS[id]}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    {cta.action.type === 'url' && (
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-muted-foreground">URL</span>
                        <input
                          type="text"
                          value={cta.action.url}
                          placeholder="https://example.com"
                          onChange={(event) => setCta({ ...cta, action: { type: 'url', url: event.target.value } })}
                          className="h-9 w-full rounded-md border border-border-strong bg-surface px-2 text-sm text-foreground"
                        />
                      </label>
                    )}
                    {cta.action.type === 'social' && (
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-muted-foreground">Profile</span>
                        <select
                          value={cta.action.social}
                          onChange={(event) =>
                            setCta({ ...cta, action: { type: 'social', social: event.target.value as (typeof CTA_SOCIAL_TYPES)[number] } })
                          }
                          className="h-9 w-full rounded-md border border-border-strong bg-surface px-2 text-sm text-foreground"
                        >
                          {CTA_SOCIAL_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {CTA_SOCIAL_LABELS[type]}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    {cta.action.type === 'email' && (
                      <p className="text-xs text-muted-foreground">
                        The button opens a message to the contact email from your profile. It hides automatically if no
                        email is set.
                      </p>
                    )}
                    {cta.action.type === 'social' && (
                      <p className="text-xs text-muted-foreground">
                        The button links to the selected profile from your social accounts. It hides automatically if it
                        isn&apos;t connected.
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : selectedSection ? (
              <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{SECTION_LABELS[selectedSection.id]}</h3>
                  <span className="font-mono text-xs text-muted-foreground">#{selectedIndex + 1}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Visible on page</span>
                  <Switch
                    checked={selectedSection.visible}
                    label={`Show ${SECTION_LABELS[selectedSection.id]}`}
                    onChange={() => toggleVisible(selectedSection.id)}
                  />
                </div>
                {selectedSection.id !== 'contact' && (
                  <div>
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">Columns</span>
                  <div
                    role="radiogroup"
                    aria-label={`${SECTION_LABELS[selectedSection.id]} columns`}
                    className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-surface-muted p-1"
                  >
                    {COLUMN_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={selectedSection.columns === option}
                        onClick={() => setColumnsFor(selectedSection.id, option)}
                        className={cn(
                          'rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
                          selectedSection.columns === option
                            ? 'bg-surface-strong text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {option} col
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    More columns turn this section&apos;s items into cards.
                  </p>
                </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" disabled={selectedIndex === 0} onClick={() => moveBy(selectedSection.id, -1)}>
                    <ChevronUp className="size-4" aria-hidden /> Up
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={selectedIndex === sections.length - 1}
                    onClick={() => moveBy(selectedSection.id, 1)}
                  >
                    <ChevronDown className="size-4" aria-hidden /> Down
                  </Button>
                </div>
                {CONTENT_LINKS[selectedSection.id] && (
                  <LinkButton href={CONTENT_LINKS[selectedSection.id]!} variant="secondary" className="w-full">
                    Edit {SECTION_LABELS[selectedSection.id].toLowerCase()} content
                  </LinkButton>
                )}
                <p className="text-xs text-muted-foreground">
                  This section uses the content from your Portfolio library.
                </p>
              </div>
            ) : (
              <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
                <h3 className="font-semibold">Page</h3>
                <p className="text-sm text-muted-foreground">
                  Template: <span className="font-medium text-foreground">{TEMPLATE_LABELS[data.template] ?? data.template}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Select a section on the canvas or in the list to inspect and rearrange it. Drag sections in the list to reorder.
                </p>
                <LinkButton href="/dashboard/design" variant="secondary" className="w-full">
                  <Palette className="size-4" aria-hidden /> Style the page
                </LinkButton>
              </div>
            )}
          </section>
        </aside>

        <div className="overflow-x-auto rounded-xl border border-border bg-surface p-3">
          <p className="mb-2 px-1 text-xs text-muted-foreground">
            Tip: click your name, headline, or bio on the canvas to edit it in place. Enter saves, Esc cancels.
          </p>
          <div className="mx-auto">
            <div
              ref={frameRef}
              onPointerDown={(event) => {
                const target = event.target as HTMLElement
                const sectionEl = target.closest('section[id]')
                const id = sectionEl?.getAttribute('id')
                if (id && SECTION_IDS.includes(id as SectionId)) {
                  setSelected(id as SectionId)
                  return
                }
                if (target.closest('header[id]')) {
                  setSelected('header')
                  return
                }
                setSelected(null)
              }}
              className={cn('relative overflow-hidden rounded-lg bg-background shadow-sm ring-1 ring-border', DEVICE_WIDTHS[device])}
            >
              <PortfolioRoot design={canvasDesign}>
                <EditableProvider enabled onCommit={handleInlineEdit}>
                  <Template
                    data={{
                      ...data,
                      name: overrides.name ?? data.name,
                      headline: overrides.headline ?? data.headline,
                      bio: overrides.bio ?? data.bio,
                      design: canvasDesign,
                    }}
                  />
                </EditableProvider>
              </PortfolioRoot>

              {selected && rects[selected] && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute z-[5] rounded-lg border-2 border-dashed border-primary/70"
                  style={rects[selected]}
                />
              )}

              {rects.header && (
                <div
                  className="absolute z-10 flex items-center rounded-md border border-border bg-surface p-0.5 shadow-sm"
                  style={{ top: rects.header.top + 8, left: rects.header.left + 8 }}
                >
                  <button
                    type="button"
                    onClick={() => setSelected('header')}
                    className={cn(
                      'rounded-md px-2 py-1 text-xs font-medium transition-colors',
                      selected === 'header' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-surface-muted'
                    )}
                  >
                    Header
                  </button>
                </div>
              )}

              {sections.map((section) => {
                const rect = rects[section.id]
                if (!section.visible || !rect) return null
                return (
                  <div
                    key={section.id}
                    className="absolute z-10 flex items-center gap-0.5 rounded-md border border-border bg-surface p-0.5 shadow-sm"
                    style={{ top: Math.max(4, rect.top - 12), left: rect.left + 8 }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(section.id)}
                      className={cn(
                        'flex items-center rounded-md px-2 py-1 text-xs font-medium transition-colors',
                        selected === section.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-surface-muted'
                      )}
                    >
                      {SECTION_LABELS[section.id]}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleVisible(section.id)}
                      aria-label={`Hide ${SECTION_LABELS[section.id]} section`}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                    >
                      <EyeOff className="size-3.5" aria-hidden />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function defaultActionFor(type: string): HeaderCta['action'] {
  if (type === 'scroll') return { type: 'scroll', section: 'projects' }
  if (type === 'url') return { type: 'url', url: '' }
  if (type === 'email') return { type: 'email' }
  return { type: 'social', social: 'GITHUB' }
}

function ToolbarIconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex size-9 items-center justify-center rounded-md transition-colors',
        disabled ? 'opacity-40' : 'text-foreground hover:bg-surface-strong'
      )}
    >
      {children}
    </button>
  )
}
