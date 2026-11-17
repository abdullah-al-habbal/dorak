"use client";

import { PlusIcon, StarIcon } from "lucide-react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { useDeleteTestimonial, useWebsiteContent } from "@/hooks/platform/settings/use-website-content";
import { localeText, testimonialSectionOptions } from "@/lib/platform/website-content.util";
import type { Testimonial } from "@/types/platform/website-content.type";

/** The quotes shown in the testimonials sections. */
export function TestimonialsPanel(): JSX.Element {
  const { dictionary, locale } = useI18n();
  const t = dictionary.content;
  const overlay = useOverlay();
  const query = useWebsiteContent();
  const remove = useDeleteTestimonial();
  const items = query.data?.testimonials ?? [];
  const lang = locale === "ar" ? "ar" : "en";
  const sections = testimonialSectionOptions(query.data?.pages ?? [], lang);

  function confirmDelete(item: Testimonial): void {
    overlay.open({
      kind: OverlayKind.Confirm,
      title: t.testimonials.confirm.title,
      description: t.testimonials.confirm.body,
      confirmLabel: t.testimonials.confirm.action,
      destructive: true,
      onConfirm: async () => {
        await remove.mutateAsync(item.id);
      },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => overlay.open({ kind: OverlayKind.TestimonialForm, sections })}>
          <PlusIcon aria-hidden data-icon="inline-start" />
          {t.testimonials.add}
        </Button>
      </div>
      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? <EmptyState title={t.states.emptyTestimonials} body="" /> : null}
        {items.length > 0 ? (
          <ul aria-label={t.tabs.testimonials} className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span dir="auto" className="font-medium">{item.author_name}</span>
                    <span dir="auto" className="text-sm text-muted-foreground">{localeText(item.author_title, lang)}</span>
                    <span className="tabular inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <StarIcon aria-hidden className="size-3.5" />
                      {t.testimonials.rating.replace("{count}", String(item.rating))}
                    </span>
                  </span>
                  <p dir="auto" className="max-w-prose text-sm text-muted-foreground">{localeText(item.body, lang)}</p>
                  {item.section_id ? null : <span className="text-xs text-muted-foreground">{t.testimonials.noSection}</span>}
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => overlay.open({ kind: OverlayKind.TestimonialForm, testimonial: item, sections })}>{t.edit}</Button>
                  <Button type="button" size="sm" variant="ghost" className="text-destructive" aria-label={t.testimonials.removeAria.replace("{name}", item.author_name)} onClick={() => confirmDelete(item)}>{t.testimonials.confirm.action}</Button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
