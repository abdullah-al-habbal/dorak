"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";
import { useUrlPage } from "@/hooks/use-url-page";
import { clampPage } from "@/lib/pagination.util";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  /** Accessible name of the navigation landmark. */
  label: string;
  /** Overrides the default URL (`?page=`) sync, for screens that own their own filter state. */
  onPageChange?: (page: number) => void;
}

export function PaginationBar({ page, totalPages, label, onPageChange }: PaginationBarProps): JSX.Element | null {
  const { direction, dictionary } = useI18n();
  const setUrlPage = useUrlPage();
  if (totalPages <= 1) return null;

  const go = onPageChange ?? setUrlPage;
  const current = clampPage(page, totalPages);
  const rtl = direction === "rtl";
  const PreviousIcon = rtl ? ChevronRightIcon : ChevronLeftIcon;
  const NextIcon = rtl ? ChevronLeftIcon : ChevronRightIcon;
  const { pagination } = dictionary.common;

  return (
    <nav className="flex items-center justify-between gap-3" aria-label={label}>
      <Button variant="outline" disabled={current <= 1} onClick={() => go(current - 1)}>
        <PreviousIcon aria-hidden data-icon="inline-start" />
        {pagination.previous}
      </Button>
      <span className="tabular text-sm text-muted-foreground" aria-live="polite">
        {pagination.page.replace("{page}", String(current)).replace("{total}", String(totalPages))}
      </span>
      <Button variant="outline" disabled={current >= totalPages} onClick={() => go(current + 1)}>
        {pagination.next}
        <NextIcon aria-hidden data-icon="inline-end" />
      </Button>
    </nav>
  );
}
