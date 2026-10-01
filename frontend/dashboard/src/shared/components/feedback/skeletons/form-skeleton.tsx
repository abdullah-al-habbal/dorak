import { Skeleton } from '@/shared/components/feedback/skeleton';

export function FormSkeleton() { return <div aria-busy="true" className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 6 }, (_, index) => <Skeleton className="h-10 w-full" key={index} />)}</div>; }
