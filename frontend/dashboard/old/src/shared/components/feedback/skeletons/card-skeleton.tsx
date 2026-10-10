import { Skeleton } from '@/shared/components/feedback/skeleton';

export function CardSkeleton() {
  return (
    <div aria-busy="true" className="space-y-3 rounded-lg border bg-surface p-5">
      <Skeleton className="h-5 w-2/5" />
      <Skeleton className="h-8 w-1/3" />
    </div>
  );
}
