'use client';
import Link from 'next/link';
import { GenericShowPage } from '@/shared/components/templates/generic-show-page';
import { CardSkeleton } from '@/shared/components/feedback/skeletons/card-skeleton';
import { APP_ROUTES, type DashboardArea } from '@/shared/routes/dashboard-routes';
import { useChair } from '@/features/chairs/hooks';
export function ChairShowPage({ area, id }: Readonly<{ area: DashboardArea; id: string }>) { const query = useChair(id); if (query.data === undefined) return <CardSkeleton />; const chair = query.data; return <GenericShowPage actions={<Link className="rounded-lg bg-primary px-3 py-2 text-sm text-background" href={APP_ROUTES.edit(area, 'chairs', id)}>Edit</Link>} details={[{ label: 'Label', value: chair.label ?? '—' }, { label: 'Status', value: chair.status }, { label: 'Floor zone', value: chair.floor_zone }, { label: 'Branch ID', value: chair.branch_id }, { label: 'Barber ID', value: chair.barber_id ?? '—' }]} title={chair.label ?? 'Chair'} />; }
