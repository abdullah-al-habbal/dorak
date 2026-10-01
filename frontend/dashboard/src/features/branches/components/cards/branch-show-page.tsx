'use client';

import Link from 'next/link';
import { GenericShowPage } from '@/shared/components/templates/generic-show-page';
import { CardSkeleton } from '@/shared/components/feedback/skeletons/card-skeleton';
import { useBranch } from '@/features/branches/hooks';
import { APP_ROUTES } from '@/shared/routes/dashboard-routes';
import type { BranchPageProps } from '@/features/branches/types/components';

export function BranchShowPage({ area, id }: Readonly<BranchPageProps>) {
  const query = useBranch(id);
  if (query.data === undefined) return <CardSkeleton />;
  const branch = query.data;
  return <GenericShowPage actions={<Link className="rounded-lg bg-primary px-3 py-2 text-sm text-background" href={APP_ROUTES.edit(area, 'branches', id)}>Edit</Link>} details={[{ label: 'English name', value: branch.name.en }, { label: 'Arabic name', value: branch.name.ar }, { label: 'Email', value: branch.email }, { label: 'Status', value: branch.status }, { label: 'Latitude', value: branch.latitude ?? '—' }, { label: 'Longitude', value: branch.longitude ?? '—' }]} title={branch.name.en} />;
}
