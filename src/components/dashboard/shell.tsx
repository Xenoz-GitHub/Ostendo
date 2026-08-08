'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FolderKanban, LayoutTemplate, Mail, MousePointerClick, Palette, UserRound } from 'lucide-react'
import { Logo } from '@/components/brand'
import { UserMenu } from '@/components/dashboard/user-menu'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home, exact: true },
  { href: '/dashboard/portfolio', label: 'Portfolio', icon: FolderKanban },
  { href: '/dashboard/messages', label: 'Messages', icon: Mail },
  { href: '/dashboard/editor', label: 'Editor', icon: MousePointerClick },
  { href: '/dashboard/template', label: 'Template', icon: LayoutTemplate },
  { href: '/dashboard/design', label: 'Design', icon: Palette },
  { href: '/dashboard/profile', label: 'Profile', icon: UserRound },
]

export function DashboardShell({
  user,
  children,
}: {
  user: {
    name: string | null
    email: string
    avatarUrl: string | null
    username: string | null
  }
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo className="md:hidden" />
          <Logo className="hidden md:flex" />
          <nav aria-label="Main" className="hidden h-full items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href, item.exact) ? 'page' : undefined}
                className={cn(
                  'flex h-full items-center border-b-2 px-3 text-sm font-medium transition-colors',
                  isActive(item.href, item.exact)
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <UserMenu user={user} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-12">
        {children}
      </main>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 h-bottom-nav border-t border-border bg-surface"
      >
        <ul className="mx-auto flex h-full w-full max-w-5xl items-stretch">
          {navItems.map((item) => (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive(item.href, item.exact) ? 'page' : undefined}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                  isActive(item.href, item.exact)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
