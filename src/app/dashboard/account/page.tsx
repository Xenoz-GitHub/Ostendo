import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { AccountUsernameForm } from '@/components/forms/account-username-form'
import { DeleteAccountForm, EmailForm, PasswordForm } from '@/components/forms/account-forms'

export const metadata: Metadata = {
  title: 'Account',
}

export default async function AccountPage() {
  const user = await requireUser()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Account"
        description="Manage your sign-in details and personal URL."
      />

      <Card>
        <CardHeader>
          <CardTitle>Your URL</CardTitle>
          <CardDescription>Your personal, shareable address. Usernames are unique.</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountUsernameForm current={user.username} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email</CardTitle>
          <CardDescription>Used for sign-in and important notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmailForm currentEmail={user.email} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Keep your account secure with a strong password.</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Delete account</CardTitle>
          <CardDescription>
            This removes your account, portfolio, and personal URL permanently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountForm />
        </CardContent>
      </Card>
    </div>
  )
}
