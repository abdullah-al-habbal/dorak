"use client";

import { PencilIcon } from "lucide-react";
import type { JSX, ReactNode } from "react";

import { CatalogCategoryStatusBadge } from "@/components/admin-catalog/catalog-category-status-badge";
import { CatalogItemPreviewList } from "@/components/admin-catalog/catalog-item-preview-list";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { localizedText } from "@/lib/booking-format.util";
import type { AdminCatalogCategory } from "@/types/admin-catalog-category.type";

interface CatalogCategoryDetailDialogProps {
  category: AdminCatalogCategory;
  onClose: () => void;
}

function Field({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-sm">{children}</dd>
    </div>
  );
}

/** Read-only overview of one category: its figures, subcategories and catalog items. Edit swaps to the form. */
export function CatalogCategoryDetailDialog({ category, onClose }: CatalogCategoryDetailDialogProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { adminCatalog: t } = dictionary;
  const overlay = useOverlay();
  const name = localizedText(category.name, locale);
  const description = localizedText(category.description ?? null, locale);

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-lg">
        <DialogHeader>
          <DialogTitle dir="auto">{name}</DialogTitle>
          <DialogDescription dir="auto">{description || t.detail.description}</DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
          <Field label={t.detail.status}><CatalogCategoryStatusBadge active={category.is_active} /></Field>
          <Field label={t.detail.audience}>{t.universe[category.universe]}</Field>
          <Field label={t.detail.items}><span className="tabular">{category.items_count}</span></Field>
          <Field label={t.detail.services}><span className="tabular">{category.services_count}</span></Field>
          <div className="col-span-2">
            <Field label={t.detail.slug}><span dir="ltr" translate="no">{category.slug}</span></Field>
          </div>
        </dl>

        <section className="flex flex-col gap-2" aria-labelledby="category-subcategories">
          <h3 id="category-subcategories" className="text-sm font-semibold">{t.detail.subcategories}</h3>
          {category.children.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.detail.noSubcategories}</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {category.children.map((child) => (
                <li key={child.id} className="flex min-w-0 max-w-full items-center gap-2 rounded-md border border-border px-2.5 py-1 text-sm">
                  <span dir="auto" className="min-w-0 break-words">{localizedText(child.name, locale)}</span>
                  <CatalogCategoryStatusBadge active={child.is_active} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-2" aria-labelledby="category-items">
          <div className="flex flex-col gap-0.5">
            <h3 id="category-items" className="text-sm font-semibold">{t.detail.itemsTitle}</h3>
            <p className="text-xs text-muted-foreground">{t.detail.itemsHint}</p>
          </div>
          <CatalogItemPreviewList categoryId={category.id} />
        </section>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>{t.detail.close}</Button>
          <Button type="button" variant="outline" onClick={() => overlay.open({ kind: OverlayKind.CatalogCategoryForm, category })}>
            <PencilIcon aria-hidden data-icon="inline-start" />
            {t.edit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
