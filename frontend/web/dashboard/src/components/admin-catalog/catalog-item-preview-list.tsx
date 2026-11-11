"use client";

import type { JSX } from "react";

import { CatalogCategoryStatusBadge } from "@/components/admin-catalog/catalog-category-status-badge";
import { ErrorState } from "@/components/common/error-state";
import { SkeletonRows } from "@/components/ui/skeleton-row";
import { useCatalogCategoryItems } from "@/hooks/use-catalog-category-items";
import { useI18n } from "@/hooks/use-i18n";
import { localizedText } from "@/lib/booking-format.util";

const LOADING_ROWS = 3;
const LOADING_ROW_CLASS = "h-9";

/** Read-only preview inside the category dialog; items are edited on the Items tab. */
export function CatalogItemPreviewList({ categoryId }: { categoryId: string }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { detail } = dictionary.adminCatalog;
  const query = useCatalogCategoryItems(categoryId);

  if (query.isPending) return <SkeletonRows count={LOADING_ROWS} rowClassName={LOADING_ROW_CLASS} />;
  if (query.isError) return <ErrorState title={detail.itemsErrorTitle} body={dictionary.adminCatalog.states.errorBody} onRetry={() => query.refetch()} />;

  const { items, total } = query.data;
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{detail.noItems}</p>;

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 px-3 py-2">
            <span className="flex min-w-0 flex-col">
              <span dir="auto" className="truncate text-sm font-medium">{localizedText(item.name, locale)}</span>
              <span className="tabular text-xs text-muted-foreground">
                {item.default_duration_minutes ? detail.duration.replace("{minutes}", String(item.default_duration_minutes)) : detail.noDuration}
              </span>
            </span>
            <CatalogCategoryStatusBadge active={item.is_active} />
          </li>
        ))}
      </ul>
      {total > items.length ? (
        <p className="tabular text-xs text-muted-foreground">{detail.itemsMore.replace("{shown}", String(items.length)).replace("{total}", String(total))}</p>
      ) : null}
    </div>
  );
}
