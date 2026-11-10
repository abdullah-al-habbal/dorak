import { CheckCircle2Icon, CircleSlashIcon, HourglassIcon, XCircleIcon } from "lucide-react";

import { BarberStatus } from "@/enums/barber-status.enum";
import type { BookingStatusStyle } from "@/interfaces/booking-status-style.interface";

export const BARBER_APPROVAL_PER_PAGE = 10;

/** Cut before they reach the URL or the backend (`DASHBOARD_BRAND_SEARCH_MAX_LENGTH`). */
export const BARBER_APPROVAL_MAX_SEARCH = 100;

/** Mirrors `BarberReviewConstants::REASON_*`; the backend stays the authority. */
export const BARBER_REJECT_REASON_MIN = 3;
export const BARBER_REJECT_REASON_MAX = 500;

/** The URL value that lifts the status filter; a bare URL opens the pending queue. */
export const BARBER_STATUS_FILTER_ALL = "all";

export const DEFAULT_BARBER_STATUS_FILTER = BarberStatus.Pending;

/** Status is always icon plus text, never colour alone. */
export const BARBER_APPROVAL_STATUS_STYLE: Record<BarberStatus, BookingStatusStyle> = {
  [BarberStatus.Pending]: { variant: "warning", icon: HourglassIcon },
  [BarberStatus.Enabled]: { variant: "success", icon: CheckCircle2Icon },
  [BarberStatus.Disabled]: { variant: "outline", icon: CircleSlashIcon },
  [BarberStatus.Rejected]: { variant: "destructive", icon: XCircleIcon },
};
