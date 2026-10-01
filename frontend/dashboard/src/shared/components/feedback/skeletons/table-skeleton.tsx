import { Skeleton } from '@/shared/components/feedback/skeleton';

export function TableSkeleton({ columns = 4, rows = 5 }: Readonly<{ columns?: number; rows?: number }>) { return <div aria-busy="true" className="space-y-3 rounded-lg border bg-surface p-4">{Array.from({ length: rows }, (_, row) => <div className="grid gap-3" key={row} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{Array.from({ length: columns }, (_, column) => <Skeleton className="h-5 w-full" key={column} />)}</div>)}</div>; }
