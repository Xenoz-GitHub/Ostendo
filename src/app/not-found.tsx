import Link from 'next/link'
import type { Metadata } from 'next'
import { LogoLink } from '@/components/brand'

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'This page could not be found.',
}

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center px-5 py-4 sm:px-8">
        <LogoLink />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 pb-16 text-center">
        <p className="text-6xl font-black tracking-tight text-surface-strong">404</p>
        <h1 className="mt-4 text-xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This page does not exist, or this portfolio has not been published yet.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Go home
        </Link>
      </main>
    </div>
  )
}
