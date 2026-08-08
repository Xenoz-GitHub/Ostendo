'use client'

import { useActionState } from 'react'
import { submitContactMessage } from '@/actions/contact'
import { Alert, Input, Label, SubmitButton, Textarea } from '@/components/ui'

export function ContactForm({ portfolioOwnerId }: { portfolioOwnerId: string }) {
  const [state, action] = useActionState(submitContactMessage.bind(null, portfolioOwnerId), {})

  if (state?.ok) {
    return <Alert tone="success">Thanks! Your message has been sent.</Alert>
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Your name</Label>
          <Input id="contact-name" name="name" placeholder="Jane Doe" autoComplete="name" required />
        </div>
        <div>
          <Label htmlFor="contact-email">Your email</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            autoComplete="email"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder="Hi, I found your portfolio and wanted to reach out…"
          required
        />
      </div>
      <div>
        <SubmitButton pendingLabel="Sending…">Send message</SubmitButton>
      </div>
    </form>
  )
}
