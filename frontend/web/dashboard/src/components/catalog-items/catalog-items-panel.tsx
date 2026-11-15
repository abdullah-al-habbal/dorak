"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FormField } from "@/components/common/form-field";
import { SearchInput } from "@/components/common/search-input";
import { CatalogCategoryStatusBadge } from "@/components/admin-catalog/catalog-category-status-badge";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useCatalogItems } from "@/hooks/services/use-catalog-admin";
import { useI18n } from "@/hooks/core/use-i18n";
import { useOverlay } from "@/hooks/core/use-overlay";
import { useServiceCategories } from "@/hooks/services/use-service-categories";
import { localizedText } from "@/lib/core/booking-format.util";

const FIRST_PAGE = 1;
const ALL = "";

/** The global catalog items: filter by category or search, then add or open one to edit. */
export function CatalogItemsPanel(): JSX.Element {
  const { dictionary, locale } = useI18n();
  const t = dictionary.adminCatalog.items;
  const overlay = useOverlay();
  const categories = useServiceCategories();
  const [categoryId, setCategoryId] = useState(ALL);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(FIRST_PAGE);
  const query = useCatalogItems(categoryId, search, page);
  const items = query.data?.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <FormField id="item-category-filter" label={t.category}>
            <NativeSelect id="item-category-filter" value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(FIRST_PAGE); }}>
              <option value={ALL}>{t.allCategories}</option>
              {categories.data?.map((category) => (
                <option key={category.id} value={category.id}>{localizedText(category.name, locale)}</option>
              ))}
            </NativeSelect>
          </FormField>
          <SearchInput value={search || undefined} label={t.search} onCommit={(value) => { setSearch(value ?? ""); setPage(FIRST_PAGE); }} />
        </div>
        <Button type="button" onClick={() => overlay.open({ kind: OverlayKind.CatalogItemForm })}>
          <PlusIcon aria-hidden data-icon="inline-start" />
          {t.newItem}
        </Button>
      </div>
      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} /> : null}
        {items.length > 0 ? (
          <>
            <ul aria-label={t.title} className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {items.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span dir="auto" className="truncate font-medium">{localizedText(item.name, locale)}</span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span dir="auto">{localizedText(item.category?.name, locale)}</span>
                      {item.default_duration_minutes ? <span className="tabular">{t.duration.replace("{minutes}", String(item.default_duration_minutes))}</span> : null}
                      {item.tags.map((tag) => <span key={tag.id} dir="auto" className="rounded-full border border-border px-2 text-xs">{localizedText(tag.name, locale)}</span>)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CatalogCategoryStatusBadge active={item.is_active} />
                    <Button type="button" size="sm" variant="outline" onClick={() => overlay.open({ kind: OverlayKind.CatalogItemForm, item })}>{t.edit}</Button>
                  </div>
                </li>
              ))}
            </ul>
            {query.data ? <PaginationBar page={query.data.page.current_page} totalPages={query.data.page.total_pages} label={t.title} onPageChange={setPage} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
