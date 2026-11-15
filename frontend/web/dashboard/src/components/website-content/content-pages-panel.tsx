"use client";

import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useI18n } from "@/hooks/core/use-i18n";
import { useOverlay } from "@/hooks/core/use-overlay";
import { useWebsiteContent } from "@/hooks/platform/use-website-content";
import { localizedText } from "@/lib/booking-format.util";

/** Every marketing page with its ordered sections; a page and a section each open their own editor. */
export function ContentPagesPanel(): JSX.Element {
  const { dictionary, locale } = useI18n();
  const t = dictionary.content;
  const overlay = useOverlay();
  const query = useWebsiteContent();
  const pages = query.data?.pages ?? [];

  return (
    <div aria-busy={query.isFetching} className="flex flex-col gap-4">
      {query.isPending ? <TableSkeleton /> : null}
      {query.isError ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
      {query.data && pages.length === 0 ? <EmptyState title={t.states.emptyPages} body="" /> : null}
      {pages.map((page) => {
        const name = localizedText(page.title, locale);
        return (
          <section key={page.id} aria-label={name} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <h2 dir="auto" className="font-heading text-xl font-semibold">{name}</h2>
                <span dir="ltr" className="tabular text-sm text-muted-foreground">/{page.slug}</span>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => overlay.open({ kind: OverlayKind.ContentPageForm, page })}>{t.pages.editPage}</Button>
            </div>
            <h3 className="text-sm font-medium">{t.pages.sections}</h3>
            {page.sections.length === 0 ? <p className="text-sm text-muted-foreground">{t.pages.noSections}</p> : null}
            <ul aria-label={t.pages.sections} className="flex flex-col divide-y divide-border">
              {[...page.sections].sort((a, b) => a.sort_order - b.sort_order).map((section) => (
                <li key={section.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="tabular w-6 text-sm text-muted-foreground">{section.sort_order}</span>
                    <span dir="ltr" className="font-medium">{section.section_type}</span>
                    <Badge variant="outline">{t.pages.audience[section.universe_visibility]}</Badge>
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    aria-label={t.pages.sectionAria.replace("{type}", section.section_type).replace("{page}", name)}
                    onClick={() => overlay.open({ kind: OverlayKind.ContentSectionForm, section })}
                  >
                    {t.edit}
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
