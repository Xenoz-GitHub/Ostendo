import type { Metadata } from 'next'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Create account — Ostendo',
  description: 'Create your free student portfolio account.',
}

export default function SignupPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-1 mb-8 text-muted-foreground">
        Free forever. Build a portfolio that represents you.
      </p>
      <SignupForm />
    </div>
  )
}
