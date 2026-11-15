import { BanIcon, CheckCircle2Icon, CircleDashedIcon, HourglassIcon } from "lucide-react";

import { PayoutAction } from "@/enums/money/payout-action.enum";
import { PayoutStatus } from "@/enums/money/payout-status.enum";
import type { BookingStatusStyle } from "@/interfaces/bookings/booking-status-style.interface";

export const PAYOUT_PER_PAGE = 10;

/** Status is always icon plus text, never colour alone. */
export const PAYOUT_STATUS_STYLE: Record<PayoutStatus, BookingStatusStyle> = {
  [PayoutStatus.Draft]: { variant: "outline", icon: CircleDashedIcon },
  [PayoutStatus.Approved]: { variant: "info", icon: HourglassIcon },
  [PayoutStatus.Paid]: { variant: "success", icon: CheckCircle2Icon },
  [PayoutStatus.Cancelled]: { variant: "outline", icon: BanIcon },
};

export const PAYOUT_REFERENCE_MAX = 255;
export const PAYOUT_NOTES_MAX = 2000;

/** Mirrors `PayoutStatus::canTransitionTo`; the backend stays the authority and answers 409 otherwise. */
export const PAYOUT_ACTIONS_BY_STATUS: Record<PayoutStatus, readonly PayoutAction[]> = {
  [PayoutStatus.Draft]: [PayoutAction.Approve, PayoutAction.Cancel],
  [PayoutStatus.Approved]: [PayoutAction.MarkPaid, PayoutAction.Cancel],
  [PayoutStatus.Paid]: [],
  [PayoutStatus.Cancelled]: [],
};
