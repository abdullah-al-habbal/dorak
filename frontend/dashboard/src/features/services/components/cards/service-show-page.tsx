'use client';
import Link from 'next/link';
import { GenericShowPage } from '@/shared/components/templates/generic-show-page';
import { CardSkeleton } from '@/shared/components/feedback/skeletons/card-skeleton';
import { APP_ROUTES, type DashboardArea } from '@/shared/routes/dashboard-routes';
import { useService } from '@/features/services/hooks';
export function ServiceShowPage({ area, id }: Readonly<{ area: DashboardArea; id: string }>) { const query = useService(id); if (query.data === undefined) return <CardSkeleton />; const service = query.data; return <GenericShowPage actions={<Link className="rounded-lg bg-primary px-3 py-2 text-sm text-background" href={APP_ROUTES.edit(area, 'services', id)}>Edit</Link>} details={[{ label: 'English name', value: service.name.en }, { label: 'Arabic name', value: service.name.ar }, { label: 'Price', value: service.price }, { label: 'Duration', value: service.duration ?? '—' }, { label: 'Active', value: String(service.active) }, { label: 'Owner type', value: service.serviceable_type }]} title={service.name.en} />; }
