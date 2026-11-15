"use client";

import { PlusIcon } from "lucide-react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { CatalogCategoryStatusBadge } from "@/components/admin-catalog/catalog-category-status-badge";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useCatalogTags } from "@/hooks/services/use-catalog-admin";
import { useI18n } from "@/hooks/core/use-i18n";
import { useOverlay } from "@/hooks/core/use-overlay";
import { localizedText } from "@/lib/booking-format.util";

/** The tags that group catalog items: add, rename, switch on or off, or remove. */
export function CatalogTagsPanel(): JSX.Element {
  const { dictionary, locale } = useI18n();
  const t = dictionary.adminCatalog.tags;
  const overlay = useOverlay();
  const query = useCatalogTags();
  const items = query.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => overlay.open({ kind: OverlayKind.CatalogTagForm })}>
          <PlusIcon aria-hidden data-icon="inline-start" />
          {t.newTag}
        </Button>
      </div>
      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} /> : null}
        {items.length > 0 ? (
          <ul aria-label={t.title} className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {items.map((tag) => (
              <li key={tag.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <span dir="auto" className="truncate font-medium">{localizedText(tag.name, locale)}</span>
                  <span className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                    <span dir="auto">{tag.group_name || t.noGroup}</span>
                    <span className="tabular">{t.itemCount.replace("{count}", String(tag.items_count))}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CatalogCategoryStatusBadge active={tag.is_active} />
                  <Button type="button" size="sm" variant="outline" onClick={() => overlay.open({ kind: OverlayKind.CatalogTagForm, tag })}>{t.edit}</Button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
