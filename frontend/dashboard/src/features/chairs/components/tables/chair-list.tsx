'use client';

import Link from 'next/link';
import { useChairs } from '@/features/chairs/hooks';
import { GenericTableListPage } from '@/shared/components/templates/generic-table-list-page';
import { useServerQueryParams } from '@/shared/hooks/use-server-query-params';
import { APP_ROUTES, type DashboardArea } from '@/shared/routes/dashboard-routes';

export function ChairList({ area }: Readonly<{ area: DashboardArea }>) {
  const params = useServerQueryParams();
  const query = useChairs(params);
  const page = query.data;
  return (
    <GenericTableListPage
      actions={
        <Link
          className="rounded-lg bg-primary px-3 py-2 text-sm text-background"
          href={APP_ROUTES.create(area, 'chairs')}
        >
          Create chair
        </Link>
      }
      description="Manage floor-plan chairs and availability."
      emptyMessage="No chairs found."
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
      title="Chairs"
    >
      <div className="rounded-lg border bg-surface">
        <table className="w-full text-left text-sm">
          <tbody>
            {page?.items.map((chair) => (
              <tr className="border-b" key={chair.id}>
                <td className="p-3">{chair.label}</td>
                <td className="p-3">{chair.status}</td>
                <td className="p-3">
                  <Link className="underline" href={APP_ROUTES.show(area, 'chairs', chair.id)}>
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
