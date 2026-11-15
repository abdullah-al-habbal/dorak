import { CheckCircle2Icon, CircleSlashIcon, HourglassIcon } from "lucide-react";

import { ClientStatus } from "@/enums/client-status.enum";
import type { BookingStatusStyle } from "@/interfaces/bookings/booking-status-style.interface";

export const CLIENT_PER_PAGE = 20;
export const CLIENT_RELATION_PER_PAGE = 20;

/** Cut before they reach the URL or the backend (`DASHBOARD_BRAND_SEARCH_MAX_LENGTH`). */
export const CLIENT_MAX_SEARCH = 100;

/** The URL value that lifts the account-status filter. */
export const CLIENT_STATUS_FILTER_ALL = "all";

/** Mirrors `BanConstants::REASON_*`; the backend stays the authority. */
export const CLIENT_BAN_REASON_MIN = 3;
export const CLIENT_BAN_REASON_MAX = 500;

/** Status is always icon plus text, never colour alone. */
export const CLIENT_STATUS_STYLE: Record<ClientStatus, BookingStatusStyle> = {
  [ClientStatus.Enabled]: { variant: "success", icon: CheckCircle2Icon },
  [ClientStatus.Pending]: { variant: "warning", icon: HourglassIcon },
  [ClientStatus.Disabled]: { variant: "outline", icon: CircleSlashIcon },
};
