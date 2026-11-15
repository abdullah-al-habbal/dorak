"use client";

import type { JSX } from "react";

import { AdminBrandList } from "@/components/admin-brands/admin-brand-list";
import { AdminBrandToolbar } from "@/components/admin-brands/admin-brand-toolbar";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { DEFAULT_BRAND_STATUS_FILTER } from "@/config/admin-brand.constant";
import { AuthActor } from "@/enums/auth-actor.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useAdminBrandFilters } from "@/hooks/use-admin-brand-filters";
import { useAdminBrands } from "@/hooks/use-admin-brands";
import { useConfirmApproveBrand } from "@/hooks/use-confirm-approve-brand";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { hasAdminBrandFilters } from "@/lib/admin-brand-filters.util";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

/** Brand approval is platform-admin only; the proxy and the backend refuse everyone else too. */
export function AdminBrandsScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor !== AuthActor.Admin) {
    const { states } = dictionary.adminBrands;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <AdminBrandsContent />;
}

function AdminBrandsContent(): JSX.Element {
  const { dictionary } = useI18n();
  const { adminBrands: t } = dictionary;
  const { filters, update } = useAdminBrandFilters();
  const overlay = useOverlay();
  const confirmApprove = useConfirmApproveBrand();
  const query = useAdminBrands(filters);
  const clear = () => update({ status: DEFAULT_BRAND_STATUS_FILTER, search: undefined });
  const changePage = (page: number) => update({ page });
  const openDetail = (brand: AdminBrand) => overlay.open({ kind: OverlayKind.BrandDetail, brand });
  const items = query.data?.items ?? [];
  const page = query.data?.page;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
      </div>

      <AdminBrandToolbar filters={filters} onChange={update} />

      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError && items.length === 0 ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? (
          hasAdminBrandFilters(filters) ? (
            <EmptyState variant="filtered" title={t.states.filteredTitle} body={t.states.filteredBody} onClear={clear} clearLabel={t.filters.clear} />
          ) : (
            <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} />
          )
        ) : null}
        {items.length > 0 ? (
          <>
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">{t.states.results.replace("{count}", String(page?.total ?? items.length))}</p>
            <AdminBrandList brands={items} onSelect={openDetail} onApprove={confirmApprove} />
            {page ? <PaginationBar page={page.current_page} totalPages={page.total_pages} label={t.title} onPageChange={changePage} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
