import { FormSkeleton } from '@/components/ui/skeleton'

export default function LoginLoading() {
  return (
    <div>
      <div className="mb-2 h-8 w-48 animate-pulse rounded bg-surface-muted" />
      <div className="mb-8 mt-1 h-5 w-64 animate-pulse rounded bg-surface-muted" />
      <FormSkeleton fields={2} />
    </div>
  )
}
