"use client";

import { CircleHelpIcon } from "lucide-react";
import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import type { BookingStatusStyle } from "@/interfaces/bookings/booking-status-style.interface";
import { warnUnknownKey } from "@/lib/core/format/enum-label.util";

interface StatusBadgeProps {
  /** The machine key from the API; it may be a status this build does not know yet. */
  status: string | null | undefined;
  styles: Readonly<Record<string, BookingStatusStyle>>;
  labels: Readonly<Record<string, string>>;
  /** Names the badge in the development warning, for example `payout`. */
  scope: string;
}

/**
 * The one status badge: icon plus text, never colour alone. A status the dictionary or the
 * style map does not know shows the localized "Unknown" text instead of throwing or showing
 * the raw key, and warns once per `scope:key` outside production.
 */
export function StatusBadge({ status, styles, labels, scope }: StatusBadgeProps): JSX.Element {
  const { common } = useDictionary();
  if (status == null || !Object.hasOwn(styles, status) || !Object.hasOwn(labels, status)) {
    warnUnknownKey(scope, status);
    return (
      <Badge variant="outline">
        <CircleHelpIcon aria-hidden />
        {common.unknown}
      </Badge>
    );
  }
  const { variant, icon: Icon } = styles[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden />
      {labels[status]}
    </Badge>
  );
}
