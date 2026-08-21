import { DashboardStatsSkeleton, CardSkeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-surface-muted" />
          <div className="h-5 w-80 animate-pulse rounded bg-surface-muted" />
        </div>
        <div className="h-11 w-32 animate-pulse rounded-lg bg-surface-muted" />
      </div>

      {/* Portfolio status card */}
      <CardSkeleton className="h-28" />

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Profile completion */}
        <div className="lg:col-span-3">
          <CardSkeleton className="h-96" />
        </div>

        {/* Stats and quick actions */}
        <div className="space-y-6 lg:col-span-2">
          <DashboardStatsSkeleton count={4} />
          <CardSkeleton className="h-64" />
        </div>
      </div>
    </div>
  )
}
