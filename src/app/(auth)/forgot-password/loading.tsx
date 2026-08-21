import { FormSkeleton } from '@/components/ui/skeleton'

export default function ForgotPasswordLoading() {
  return (
    <div>
      <div className="mb-2 h-8 w-52 animate-pulse rounded bg-surface-muted" />
      <div className="mb-8 mt-1 h-5 w-80 animate-pulse rounded bg-surface-muted" />
      <FormSkeleton fields={1} />
    </div>
  )
}
