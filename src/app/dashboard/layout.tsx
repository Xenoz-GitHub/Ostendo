import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth'
import { DashboardShell } from '@/components/dashboard/shell'

export const metadata: Metadata = {
  title: {
    default: 'Dashboard — Ostendo',
    template: '%s — Ostendo',
  },
}

export default async function DashboardLayout({ children }: LayoutProps<'/dashboard'>) {
  const user = await requireUser()

  return (
    <DashboardShell
      user={{
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        username: user.username,
      }}
    >
      {children}
    </DashboardShell>
  )
}
