import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src="/logo.png"
        alt="Ostendo logo"
        width={32}
        height={32}
        className="size-8 rounded-full object-cover"
      />
      <span className="text-lg font-semibold tracking-tight">Ostendo</span>
    </div>
  )
}

export function LogoLink({ className }: { className?: string }) {
  return (
    <Link href="/dashboard" className={cn('inline-flex', className)} aria-label="Ostendo home">
      <Logo />
    </Link>
  )
}
