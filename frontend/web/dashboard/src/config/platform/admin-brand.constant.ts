import { CheckCircle2Icon, HourglassIcon, PauseCircleIcon, XCircleIcon } from "lucide-react";

import { BrandStatus } from "@/enums/venue/brand-status.enum";
import type { BookingStatusStyle } from "@/interfaces/bookings/booking-status-style.interface";

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
  [BrandStatus.Rejected]: { variant: "destructive", icon: XCircleIcon },
  [BrandStatus.Suspended]: { variant: "outline", icon: PauseCircleIcon },
};

export const BRAND_REASON_MIN = 3;
export const BRAND_REASON_MAX = 500;
export const BRAND_HISTORY_PER_PAGE = 20;
export const BRAND_MAX_DESCRIPTION = 5000;
export const BRAND_MAX_NAME = 255;

/** Mirrors `BrandFeatureConstants`; the backend answers the flags under these keys. */
export const BRAND_FEATURE_KEYS = ["multi_branch", "job_board"] as const;
