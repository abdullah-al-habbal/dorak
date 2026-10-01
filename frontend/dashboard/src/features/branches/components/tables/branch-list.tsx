'use client';

import Link from 'next/link';
import { useServerQueryParams } from '@/shared/hooks/use-server-query-params';
import { GenericTableListPage } from '@/shared/components/templates/generic-table-list-page';
import { useBranches } from '@/features/branches/hooks/use-branches';

interface BranchListProps {
  basePath: '/admin' | '/manager';
  canCreate: boolean;
}

export function BranchList({ basePath, canCreate }: Readonly<BranchListProps>) {
  const params = useServerQueryParams();
  const query = useBranches(params);
  const page = query.data;

  return <GenericTableListPage actions={canCreate ? <Link className="rounded-lg bg-primary px-3 py-2 text-sm text-background" href={`${basePath}/branches/new`}>Create branch</Link> : undefined} description="Manage branch accounts and location settings." emptyMessage="No branches found." isLoading={query.isLoading} onPageChange={params.setPage} onSearchChange={params.setSearch} pagination={page?.pagination && { currentPage: page.pagination.currentPage, totalPages: page.pagination.totalPages }} search={params.search ?? ''} title="Branches"><div className="overflow-x-auto rounded-lg border bg-surface"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3" /></tr></thead><tbody>{page?.items.map((branch) => <tr className="border-b" key={branch.id}><td className="p-3">{branch.name.en}</td><td className="p-3">{branch.email}</td><td className="p-3">{branch.status}</td><td className="p-3"><Link className="text-sm underline" href={`${basePath}/branches/${branch.id}`}>View</Link></td></tr>)}</tbody></table></div></GenericTableListPage>;
}
