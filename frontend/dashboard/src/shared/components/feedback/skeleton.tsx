export function Skeleton({ className = '' }: Readonly<{ className?: string }>) { return <div aria-busy="true" className={`animate-pulse rounded-lg bg-muted ${className}`} />; }
