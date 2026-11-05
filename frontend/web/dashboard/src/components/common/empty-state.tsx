import { CalendarX2Icon, LockIcon, SearchXIcon } from "lucide-react";
import type { JSX, ReactNode } from "react";

import { Notice } from "@/components/common/notice";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  body: string;
  /** Present when the list is empty because of filters: offers a way out. */
  onClear?: () => void;
  clearLabel?: string;
  /** "forbidden" swaps the icon for a lock. */
  variant?: "empty" | "filtered" | "forbidden";
  action?: ReactNode;
}

const ICONS = {
  empty: <CalendarX2Icon className="size-8" />,
  filtered: <SearchXIcon className="size-8" />,
  forbidden: <LockIcon className="size-8" />,
} as const;

export function EmptyState({ title, body, onClear, clearLabel, variant = "empty", action }: EmptyStateProps): JSX.Element {
  return (
    <Notice icon={ICONS[variant]} title={title} body={body}>
      {onClear && clearLabel ? <Button variant="outline" onClick={onClear}>{clearLabel}</Button> : null}
      {action}
    </Notice>
  );
}
