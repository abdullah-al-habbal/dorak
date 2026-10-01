'use client';

import Link from 'next/link';
import { GenericTableListPage } from '@/shared/components/templates/generic-table-list-page';
import { useServerQueryParams } from '@/shared/hooks/use-server-query-params';
import { APP_ROUTES, type DashboardArea } from '@/shared/routes/dashboard-routes';
import { useStylists } from '@/features/stylists/hooks/use-stylists';

export function StylistList({ area }: Readonly<{ area: DashboardArea }>) { const params = useServerQueryParams(); const query = useStylists(params); const page = query.data; return <GenericTableListPage actions={<Link className="rounded-lg bg-primary px-3 py-2 text-sm text-background" href={APP_ROUTES.create(area, 'stylists')}>Create stylist</Link>} description="Manage barber credentials and chair assignments." emptyMessage="No stylists found." isLoading={query.isLoading} onPageChange={params.setPage} onSearchChange={params.setSearch} pagination={page === undefined ? undefined : { currentPage: page.pagination.currentPage, totalPages: page.pagination.totalPages }} search={params.search ?? ''} title="Stylists"><div className="rounded-lg border bg-surface"><table className="w-full text-left text-sm"><tbody>{page?.items.map((stylist) => <tr className="border-b" key={stylist.id}><td className="p-3">{stylist.name.en}</td><td className="p-3">{stylist.status}</td><td className="p-3"><Link className="underline" href={APP_ROUTES.show(area, 'stylists', stylist.id)}>View</Link></td></tr>)}</tbody></table></div></GenericTableListPage>; }
