import { LogoLink } from '@/components/brand'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center px-5 py-4 sm:px-8">
        <LogoLink />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16">
        {children}
      </main>
    </div>
  )
}
