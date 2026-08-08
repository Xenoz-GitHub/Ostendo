import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Sign in — Ostendo',
  description: 'Sign in to your Ostendo account.',
}

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1 mb-8 text-muted-foreground">Sign in to manage your portfolio.</p>
      <LoginForm />
    </div>
  )
}
