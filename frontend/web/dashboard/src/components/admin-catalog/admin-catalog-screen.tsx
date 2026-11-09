"use client";

import { InfoIcon } from "lucide-react";
import type { JSX } from "react";

import { AdminCatalogToolbar } from "@/components/admin-catalog/admin-catalog-toolbar";
import { CatalogCategoryList } from "@/components/admin-catalog/catalog-category-list";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { AuthActor } from "@/enums/auth-actor.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useAdminCatalogCategories } from "@/hooks/use-admin-catalog-categories";
import { useAdminCatalogFilters } from "@/hooks/use-admin-catalog-filters";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { useUpdateCatalogCategoryActive } from "@/hooks/use-update-catalog-category-active";
import { hasAdminCatalogFilters } from "@/lib/admin-catalog-filters.util";
import { localizedText } from "@/lib/booking-format.util";
import type { AdminCatalogCategory } from "@/types/admin-catalog-category.type";

/** The global catalog is platform-admin only; the proxy and the backend refuse everyone else too. */
export function AdminCatalogScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor !== AuthActor.Admin) {
    const { states } = dictionary.adminCatalog;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <AdminCatalogContent />;
}

function AdminCatalogContent(): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { adminCatalog: t } = dictionary;
  const { filters, update } = useAdminCatalogFilters();
  const overlay = useOverlay();
  const query = useAdminCatalogCategories(filters);
  const toggle = useUpdateCatalogCategoryActive();
  const { mutate: toggleActive } = toggle;
  const clear = () => update({ status: undefined, search: undefined });
  const openNew = () => overlay.open({ kind: OverlayKind.CatalogCategoryForm });
  const openEdit = (category: AdminCatalogCategory) => overlay.open({ kind: OverlayKind.CatalogCategoryForm, category });
  const openDetail = (category: AdminCatalogCategory) => overlay.open({ kind: OverlayKind.CatalogCategoryDetail, category });
  const { mutateAsync: toggleActiveAsync } = toggle;
  // Switching on is instant; switching off confirms first and states what it does (and doesn't) hide.
  const onToggle = (category: AdminCatalogCategory, active: boolean) => {
    if (active) {
      toggleActive({ id: category.id, active });
      return;
    }
    overlay.open({
      kind: OverlayKind.Confirm,
      title: t.confirm.deactivateTitle,
      description: t.confirm.deactivateBody.replace("{category}", localizedText(category.name, locale)),
      confirmLabel: t.confirm.deactivate,
      destructive: true,
      onConfirm: async () => {
        await toggleActiveAsync({ id: category.id, active });
      },
    });
  };
  const items = query.data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
        <p className="flex max-w-prose items-start gap-1.5 text-xs text-muted-foreground">
          <InfoIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          {t.deactivateNote}
        </p>
      </div>

      <AdminCatalogToolbar filters={filters} onChange={update} onCreate={openNew} />

      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError && items.length === 0 ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? (
          hasAdminCatalogFilters(filters) ? (
            <EmptyState variant="filtered" title={t.states.filteredTitle} body={t.states.filteredBody} onClear={clear} clearLabel={t.filters.clear} />
          ) : (
            <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} action={<Button onClick={openNew}>{t.newCategory}</Button>} />
          )
        ) : null}
        {items.length > 0 ? (
          <>
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">{t.states.results.replace("{count}", String(items.length))}</p>
            <CatalogCategoryList categories={items} togglingId={toggle.isPending ? toggle.variables?.id : undefined} onSelect={openDetail} onEdit={openEdit} onToggle={onToggle} />
          </>
        ) : null}
      </div>
    </div>
  );
}
