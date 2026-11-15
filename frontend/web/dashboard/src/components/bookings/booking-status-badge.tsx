"use client";

import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS_STYLE } from "@/config/booking-status-badge.constant";
import type { BookingStatus } from "@/enums/booking-status.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { bookings } = useDictionary();
  const { variant, icon: Icon } = BOOKING_STATUS_STYLE[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden />
      {bookings.status[status]}
    </Badge>
  );
}
