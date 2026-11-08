import { CheckCircle2Icon, HourglassIcon } from "lucide-react";

import { BrandStatus } from "@/enums/brand-status.enum";
import type { BookingStatusStyle } from "@/interfaces/booking-status-style.interface";

export const ADMIN_BRAND_PER_PAGE = 10;

/** Brand names longer than this are cut before they reach the URL or the backend (`DASHBOARD_BRAND_SEARCH_MAX_LENGTH`). */
export const ADMIN_BRAND_MAX_SEARCH = 100;

/** The URL value that lifts the status filter; a bare URL opens the pending queue. */
export const BRAND_STATUS_FILTER_ALL = "all";

/** The approval queue is what admins come for, so it is the default view. */
export const DEFAULT_BRAND_STATUS_FILTER = BrandStatus.Pending;

/** Status is always icon plus text, never colour alone. */
export const BRAND_STATUS_STYLE: Record<BrandStatus, BookingStatusStyle> = {
  [BrandStatus.Pending]: { variant: "warning", icon: HourglassIcon },
  [BrandStatus.Active]: { variant: "success", icon: CheckCircle2Icon },
};
