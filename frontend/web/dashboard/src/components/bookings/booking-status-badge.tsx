"use client";

import type { JSX } from "react";
import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS_STYLE } from "@/config/ops/booking-status-badge.constant";
import type { BookingStatus } from "@/enums/booking/booking-status.enum";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function BookingStatusBadge({ status }: { status: BookingStatus }): JSX.Element {
  const { bookings } = useDictionary();
  const { variant, icon: Icon } = BOOKING_STATUS_STYLE[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden />
      {bookings.status[status]}
    </Badge>
  );
}
