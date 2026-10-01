'use client';

import Link from 'next/link';
import { useServices } from '@/features/services/hooks';
import { GenericTableListPage } from '@/shared/components/templates/generic-table-list-page';
import { useServerQueryParams } from '@/shared/hooks/use-server-query-params';
import { APP_ROUTES, type DashboardArea } from '@/shared/routes/dashboard-routes';

export function ServiceList({ area }: Readonly<{ area: DashboardArea }>) {
  const params = useServerQueryParams();
  const query = useServices(params);
  const page = query.data;
  return (
    <GenericTableListPage
      actions={
        <Link
          className="rounded-lg bg-primary px-3 py-2 text-sm text-background"
          href={APP_ROUTES.create(area, 'services')}
        >
          Create service
        </Link>
      }
      description="Manage prices and duration."
      emptyMessage="No services found."
      isEmpty={page?.items.length === 0}
      isLoading={query.isLoading}
      onPageChange={params.setPage}
      onSearchChange={params.setSearch}
      pagination={
        page === undefined
          ? undefined
          : { currentPage: page.pagination.currentPage, totalPages: page.pagination.totalPages }
      }
      search={params.search ?? ''}
      title="Services"
    >
      <div className="rounded-lg border bg-surface">
        <table className="w-full text-left text-sm">
          <tbody>
            {page?.items.map((service) => (
              <tr className="border-b" key={service.id}>
                <td className="p-3">{service.name.en}</td>
                <td className="p-3">{service.price}</td>
                <td className="p-3">
                  <Link className="underline" href={APP_ROUTES.show(area, 'services', service.id)}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GenericTableListPage>
  );
}
