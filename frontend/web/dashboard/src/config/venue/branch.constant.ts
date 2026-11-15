import { CheckCircle2Icon, ClockIcon, PauseCircleIcon, ShieldAlertIcon } from "lucide-react";

import { BranchStatus } from "@/enums/venue/branch-status.enum";
import type { BookingStatusStyle } from "@/interfaces/bookings/booking-status-style.interface";

export const BRANCH_PER_PAGE = 20;
export const BRANCH_OPTIONS_LIMIT = 100;
/** The limits below mirror `BranchRequest` and `StoreBranchRequest` in the backend. */
export const BRANCH_MAX_NAME = 120;
export const BRANCH_MAX_EMAIL = 255;
export const BRANCH_MAX_ADDRESS = 255;
export const BRANCH_MAX_DESCRIPTION = 2000;
export const BRANCH_MAX_SEARCH = 100;
export const BRANCH_MIN_PASSWORD = 12;
export const BRANCH_MAX_PASSWORD = 255;
export const LATITUDE_LIMIT = 90;
export const LONGITUDE_LIMIT = 180;

/** Status is always icon plus text, never colour alone. */
export const BRANCH_STATUS_STYLE: Record<BranchStatus, BookingStatusStyle> = {
  [BranchStatus.Enabled]: { variant: "success", icon: CheckCircle2Icon },
  [BranchStatus.Pending]: { variant: "warning", icon: ClockIcon },
  [BranchStatus.Disabled]: { variant: "outline", icon: PauseCircleIcon },
  [BranchStatus.Suspended]: { variant: "destructive", icon: ShieldAlertIcon },
};
