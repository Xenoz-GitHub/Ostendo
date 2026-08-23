'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { LogOut, Settings, UserRound, ChevronDown, Moon, Sun } from 'lucide-react'
import { logout } from '@/actions/auth'
import { initials } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useAppOrigin } from '@/lib/use-origin'
import { useTheme } from '@/components/theme/theme-provider'

export function UserMenu({
  user,
}: {
  user: {
    name: string | null
    email: string
    avatarUrl: string | null
    username: string | null
  }
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const origin = useAppOrigin()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-surface-muted"
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" className="size-8 rounded-full object-cover" />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-surface-strong text-xs font-semibold">
            {initials(user.name)}
          </span>
        )}
        <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold">{user.name ?? 'Student'}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            {user.username && (
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {origin ? `${origin}/${user.username}` : user.username}
              </p>
            )}
          </div>
          <div className="p-1.5">
            <MenuItem href="/dashboard/profile" icon={<UserRound className="size-4" />}>
              Edit profile
            </MenuItem>
            <MenuItem href="/dashboard/account" icon={<Settings className="size-4" />}>
              Account settings
            </MenuItem>
            <button
              type="button"
              onClick={toggleTheme}
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-surface-muted"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="size-4" aria-hidden />
                  Dark mode
                </>
              ) : (
                <>
                  <Sun className="size-4" aria-hidden />
                  Light mode
                </>
              )}
            </button>
            <form action={logout} className="p-1.5">
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-destructive transition-colors hover:bg-destructive-muted"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({
  href,
  icon,
  children,
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-surface-muted"
    >
      {icon}
      {children}
    </Link>
  )
}
