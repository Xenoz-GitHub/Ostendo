export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDateRange(
  start: string | undefined,
  end: string | undefined,
  current: boolean
): string {
  const fmt = (v: string | undefined) => {
    if (!v) return undefined
    const [year, month] = v.split('-')
    if (!month) return year
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    const name = monthNames[Number(month) - 1]
    return name ? `${name} ${year}` : year
  }
  const s = fmt(start)
  const e = current ? 'Present' : fmt(end)
  if (s && e) return `${s} – ${e}`
  return s ?? e ?? ''
}

export function formatYearRange(
  start: number | null | undefined,
  end: number | null | undefined
): string {
  if (start && end) return `${start} – ${end}`
  if (start) return `${start} – Present`
  return ''
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
