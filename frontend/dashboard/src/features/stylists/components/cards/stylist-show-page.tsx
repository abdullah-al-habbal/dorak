'use client';
import Link from 'next/link';
import { GenericShowPage } from '@/shared/components/templates/generic-show-page';
import { CardSkeleton } from '@/shared/components/feedback/skeletons/card-skeleton';
import { APP_ROUTES, type DashboardArea } from '@/shared/routes/dashboard-routes';
import { useStylist } from '@/features/stylists/hooks';
export function StylistShowPage({ area, id }: Readonly<{ area: DashboardArea; id: string }>) { const query = useStylist(id); if (query.data === undefined) return <CardSkeleton />; const stylist = query.data; return <GenericShowPage actions={<Link className="rounded-lg bg-primary px-3 py-2 text-sm text-background" href={APP_ROUTES.edit(area, 'stylists', id)}>Edit</Link>} details={[{ label: 'English name', value: stylist.name.en }, { label: 'Arabic name', value: stylist.name.ar }, { label: 'Email', value: stylist.email }, { label: 'Phone', value: stylist.phone ?? '—' }, { label: 'Status', value: stylist.status }]} title={stylist.name.en} />; }
