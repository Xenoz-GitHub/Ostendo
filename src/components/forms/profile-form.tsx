'use client'

import { useEffect } from 'react'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/actions/profile'
import { Alert, FieldError, FieldHint, Input, Label, SubmitButton, Textarea } from '@/components/ui'
import { ImageUploader } from '@/components/upload/image-uploader'

export function ProfileForm({
  defaults,
  submitLabel = 'Save changes',
  onboarding = false,
}: {
  defaults: {
    name: string | null
    avatarUrl: string | null
    headline: string | null
    bio: string | null
    university: string | null
    major: string | null
    graduationYear: number | null
    location: string | null
    contactEmail: string | null
    websiteUrl: string | null
  }
  submitLabel?: string
  onboarding?: boolean
}) {
  const [state, action] = useActionState(updateProfile, undefined)
  const router = useRouter()

  useEffect(() => {
    if (!state?.success) return
    if (!onboarding) return
    const timer = setTimeout(() => router.push('/dashboard'), 900)
    return () => clearTimeout(timer)
  }, [state?.success, onboarding, router])

  return (
    <form action={action} className="space-y-6" noValidate>
      {state?.message && !state?.success && <Alert tone="error">{state.message}</Alert>}
      {state?.success && (
        <Alert tone="success">
          {onboarding ? 'Profile saved — taking you to your dashboard…' : state.message}
        </Alert>
      )}

      {onboarding ? (
        <>
          <p className="text-sm text-muted-foreground">
            Just the essentials to get you started — you can add photos, school, and links from your dashboard
            later.
          </p>
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" defaultValue={defaults.name ?? ''} invalid={Boolean(state?.errors?.name)} />
            <FieldError>{state?.errors?.name?.[0]}</FieldError>
          </div>
          <div>
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              name="headline"
              placeholder="Computer Science Student"
              defaultValue={defaults.headline ?? ''}
              invalid={Boolean(state?.errors?.headline)}
            />
            <FieldHint>One line about what you do. Optional.</FieldHint>
            <FieldError>{state?.errors?.headline?.[0]}</FieldError>
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={3}
              placeholder="Tell people what you build and care about."
              defaultValue={defaults.bio ?? ''}
              invalid={Boolean(state?.errors?.bio)}
            />
            <FieldHint>Optional — write as much or as little as you like.</FieldHint>
            <FieldError>{state?.errors?.bio?.[0]}</FieldError>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" defaultValue={defaults.name ?? ''} invalid={Boolean(state?.errors?.name)} />
              <FieldError>{state?.errors?.name?.[0]}</FieldError>
            </div>
            <div>
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                name="headline"
                placeholder="Computer Science Student"
                defaultValue={defaults.headline ?? ''}
                invalid={Boolean(state?.errors?.headline)}
              />
              <FieldError>{state?.errors?.headline?.[0]}</FieldError>
            </div>
          </div>

          <div>
            <Label htmlFor="avatarUrl">Profile photo</Label>
            <ImageUploader
              fieldName="avatarUrl"
              defaultValue={defaults.avatarUrl}
              round
              hint="Square photos work best — they are cropped to a circle."
            />
            <FieldError>{state?.errors?.avatarUrl?.[0]}</FieldError>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={4}
              placeholder="Tell people what you build and care about."
              defaultValue={defaults.bio ?? ''}
              invalid={Boolean(state?.errors?.bio)}
            />
            <FieldError>{state?.errors?.bio?.[0]}</FieldError>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                name="university"
                placeholder="University of Example"
                defaultValue={defaults.university ?? ''}
                invalid={Boolean(state?.errors?.university)}
              />
              <FieldError>{state?.errors?.university?.[0]}</FieldError>
            </div>
            <div>
              <Label htmlFor="major">Major / field</Label>
              <Input
                id="major"
                name="major"
                placeholder="Computer Science"
                defaultValue={defaults.major ?? ''}
                invalid={Boolean(state?.errors?.major)}
              />
              <FieldError>{state?.errors?.major?.[0]}</FieldError>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="graduationYear">Graduation year</Label>
              <Input
                id="graduationYear"
                name="graduationYear"
                type="number"
                inputMode="numeric"
                min={1950}
                max={2100}
                placeholder="2028"
                defaultValue={defaults.graduationYear?.toString() ?? ''}
                invalid={Boolean(state?.errors?.graduationYear)}
              />
              <FieldError>{state?.errors?.graduationYear?.[0]}</FieldError>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Manila, Philippines"
                defaultValue={defaults.location ?? ''}
                invalid={Boolean(state?.errors?.location)}
              />
              <FieldError>{state?.errors?.location?.[0]}</FieldError>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="contactEmail">Public contact email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                placeholder="you@example.com"
                defaultValue={defaults.contactEmail ?? ''}
                invalid={Boolean(state?.errors?.contactEmail)}
              />
              <FieldError>{state?.errors?.contactEmail?.[0]}</FieldError>
            </div>
            <div>
              <Label htmlFor="websiteUrl">Personal website</Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                placeholder="https://…"
                defaultValue={defaults.websiteUrl ?? ''}
                invalid={Boolean(state?.errors?.websiteUrl)}
              />
              <FieldError>{state?.errors?.websiteUrl?.[0]}</FieldError>
            </div>
          </div>
        </>
      )}

      <div className="flex gap-3">
        <SubmitButton pendingLabel="Saving…">{submitLabel}</SubmitButton>
      </div>
    </form>
  )
}
