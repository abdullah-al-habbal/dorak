"use client";

import type { JSX } from "react";
import { BOOKING_STATUS_STYLE } from "@/config/ops/booking-status-badge.constant";
import type { BookingStatus } from "@/enums/booking/booking-status.enum";
import { StatusBadge } from "@/components/common/status-badge";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function BookingStatusBadge({ status }: { status: BookingStatus }): JSX.Element {
  const { bookings } = useDictionary();
  return <StatusBadge status={status} styles={BOOKING_STATUS_STYLE} labels={bookings.status} scope="booking" />;
}
