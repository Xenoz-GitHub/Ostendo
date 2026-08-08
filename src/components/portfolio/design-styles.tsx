import { designToCssVars, fontCssUrl, type DesignState } from '@/lib/design'
import { cn } from '@/lib/utils'

/** Applies a per-portfolio design (colors, fonts, layout, buttons) to its subtree. */
export function PortfolioRoot({
  design,
  className,
  children,
}: {
  design: DesignState
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('pf-root', className)} data-btn-style={design.buttons.style} style={designToCssVars(design)}>
      <DesignFontLinks design={design} />
      {children}
    </div>
  )
}

/** Loads the Google Fonts needed by a design (deduplicated, no-op when system only). */
export function DesignFontLinks({ design }: { design: DesignState }) {
  const ids = [...new Set([design.typography.body, design.typography.heading].filter((id) => id !== 'system'))]
  if (ids.length === 0) return null
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {ids.map((id) => {
        const href = fontCssUrl(id)
        if (!href) return null
        return <link key={id} rel="stylesheet" href={href} />
      })}
    </>
  )
}
