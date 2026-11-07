import { AlertTriangleIcon, BanIcon, CheckCircle2Icon, HourglassIcon } from "lucide-react";

import { SubscriptionStatus } from "@/enums/subscription-status.enum";
import type { BookingStatusStyle } from "@/interfaces/booking-status-style.interface";

/** Status is always icon plus text, never colour alone. */
export const SUBSCRIPTION_STATUS_STYLE: Record<SubscriptionStatus, BookingStatusStyle> = {
  [SubscriptionStatus.Pending]: { variant: "info", icon: HourglassIcon },
  [SubscriptionStatus.Active]: { variant: "success", icon: CheckCircle2Icon },
  [SubscriptionStatus.PastDue]: { variant: "warning", icon: AlertTriangleIcon },
  [SubscriptionStatus.Cancelled]: { variant: "outline", icon: BanIcon },
};
