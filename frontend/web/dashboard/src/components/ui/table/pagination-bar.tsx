"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/core/use-i18n";
import { clampPage } from "@/lib/core/pagination.util";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  /** Accessible name of the navigation landmark. */
  label: string;
  /** Moves to a page; screens pass their URL filter hook's page setter so filters and page stay in one place. */
  onPageChange: (page: number) => void;
}

export function PaginationBar({ page, totalPages, label, onPageChange }: PaginationBarProps): JSX.Element | null {
  const { direction, dictionary } = useI18n();
  if (totalPages <= 1) return null;

  const current = clampPage(page, totalPages);
  const rtl = direction === "rtl";
  const PreviousIcon = rtl ? ChevronRightIcon : ChevronLeftIcon;
  const NextIcon = rtl ? ChevronLeftIcon : ChevronRightIcon;
  const { pagination } = dictionary.common;

  return (
    <nav className="flex items-center justify-between gap-3" aria-label={label}>
      <Button variant="outline" disabled={current <= 1} onClick={() => onPageChange(current - 1)}>
        <PreviousIcon aria-hidden data-icon="inline-start" />
        {pagination.previous}
      </Button>
      <span className="tabular text-sm text-muted-foreground" aria-live="polite">
        {pagination.page.replace("{page}", String(current)).replace("{total}", String(totalPages))}
      </span>
      <Button variant="outline" disabled={current >= totalPages} onClick={() => onPageChange(current + 1)}>
        {pagination.next}
        <NextIcon aria-hidden data-icon="inline-end" />
      </Button>
    </nav>
  );
}
