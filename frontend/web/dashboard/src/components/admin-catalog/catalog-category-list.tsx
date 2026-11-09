"use client";

import { PencilIcon } from "lucide-react";
import type { JSX } from "react";

import { CatalogCategoryStatusBadge } from "@/components/admin-catalog/catalog-category-status-badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/ui/table/data-table";
import { useI18n } from "@/hooks/use-i18n";
import type { DataTableColumn } from "@/interfaces/data-table-column.interface";
import { localizedText } from "@/lib/booking-format.util";
import type { AdminCatalogCategory } from "@/types/admin-catalog-category.type";

interface CatalogCategoryListProps {
  categories: readonly AdminCatalogCategory[];
  togglingId: string | undefined;
  onSelect: (category: AdminCatalogCategory) => void;
  onEdit: (category: AdminCatalogCategory) => void;
  onToggle: (category: AdminCatalogCategory, active: boolean) => void;
}

function getCategoryId(category: AdminCatalogCategory): string {
  return category.id;
}

export function CatalogCategoryList({ categories, togglingId, onSelect, onEdit, onToggle }: CatalogCategoryListProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { adminCatalog: t } = dictionary;
  const nameOf = (category: AdminCatalogCategory) => localizedText(category.name, locale);
  const rowLabel = (category: AdminCatalogCategory) => t.rowLabel.replace("{category}", nameOf(category));

  const columns: DataTableColumn<AdminCatalogCategory>[] = [
    {
      id: "category",
      header: t.columns.category,
      primary: true,
      cell: (category) => (
        <span className="flex min-w-0 flex-col">
          <span dir="auto" className="truncate font-medium">{nameOf(category) || t.none}</span>
          {category.children_count > 0 ? <span className="text-xs text-muted-foreground">{t.subcategories.replace("{count}", String(category.children_count))}</span> : null}
        </span>
      ),
    },
    { id: "audience", header: t.columns.audience, cell: (category) => t.universe[category.universe] },
    { id: "items", header: t.columns.items, align: "end", cell: (category) => <span className="tabular">{category.items_count}</span> },
    { id: "services", header: t.columns.services, align: "end", cell: (category) => <span className="tabular">{category.services_count}</span> },
    { id: "status", header: t.columns.status, cell: (category) => <CatalogCategoryStatusBadge active={category.is_active} /> },
    {
      id: "active",
      header: t.columns.active,
      interactive: true,
      cell: (category) => (
        <Switch
          checked={category.is_active}
          disabled={togglingId === category.id}
          aria-label={(category.is_active ? t.toggle.deactivate : t.toggle.activate).replace("{name}", nameOf(category))}
          onCheckedChange={(checked) => onToggle(category, checked)}
        />
      ),
    },
    {
      id: "actions",
      header: t.columns.actions,
      interactive: true,
      align: "end",
      cell: (category) => (
        <Button size="sm" variant="outline" aria-label={t.editAction.replace("{category}", nameOf(category))} onClick={() => onEdit(category)}>
          <PencilIcon aria-hidden data-icon="inline-start" />
          {t.edit}
        </Button>
      ),
    },
  ];

  return <DataTable caption={t.title} columns={columns} rows={categories} getRowId={getCategoryId} onRowSelect={onSelect} rowLabel={rowLabel} />;
}
