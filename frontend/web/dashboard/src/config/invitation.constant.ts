import { CheckCircle2Icon, HourglassIcon, UserXIcon, XCircleIcon } from "lucide-react";

import { AffiliationStatus } from "@/enums/affiliation-status.enum";
import type { BookingStatusStyle } from "@/interfaces/booking-status-style.interface";

/** The backend refuses a shorter lookup, so the picker doesn't ask. */
export const BARBER_LOOKUP_MIN = 3;
export const COMMISSION_MIN = 0;
export const COMMISSION_MAX = 100;
/** The URL-free filter value that lifts the status filter. */
export const INVITATION_FILTER_ALL = "all";

export const INVITATION_STATUSES: readonly AffiliationStatus[] = [AffiliationStatus.Pending, AffiliationStatus.Active, AffiliationStatus.Rejected, AffiliationStatus.Terminated];

/** Status is always icon plus text, never colour alone. */
export const AFFILIATION_STATUS_STYLE: Record<AffiliationStatus, BookingStatusStyle> = {
  [AffiliationStatus.Pending]: { variant: "warning", icon: HourglassIcon },
  [AffiliationStatus.Active]: { variant: "success", icon: CheckCircle2Icon },
  [AffiliationStatus.Rejected]: { variant: "destructive", icon: XCircleIcon },
  [AffiliationStatus.Terminated]: { variant: "outline", icon: UserXIcon },
};
