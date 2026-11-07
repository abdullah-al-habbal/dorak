import { BanIcon, CheckCircle2Icon, CircleDashedIcon, HourglassIcon } from "lucide-react";

import { PayoutStatus } from "@/enums/payout-status.enum";
import type { BookingStatusStyle } from "@/interfaces/booking-status-style.interface";

export const PAYOUT_PER_PAGE = 10;

/** Status is always icon plus text, never colour alone. */
export const PAYOUT_STATUS_STYLE: Record<PayoutStatus, BookingStatusStyle> = {
  [PayoutStatus.Draft]: { variant: "outline", icon: CircleDashedIcon },
  [PayoutStatus.Approved]: { variant: "info", icon: HourglassIcon },
  [PayoutStatus.Paid]: { variant: "success", icon: CheckCircle2Icon },
  [PayoutStatus.Cancelled]: { variant: "outline", icon: BanIcon },
};
