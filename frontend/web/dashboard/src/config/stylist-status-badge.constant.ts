import { CheckCircle2Icon, CircleSlashIcon, ClockIcon, XCircleIcon } from "lucide-react";

import { BarberStatus } from "@/enums/barber-status.enum";
import type { BookingStatusStyle } from "@/interfaces/booking-status-style.interface";

/** Same shape as the booking badge style; status is always icon plus text. */
export const STYLIST_STATUS_STYLE: Record<BarberStatus, BookingStatusStyle> = {
  [BarberStatus.Pending]: { variant: "warning", icon: ClockIcon },
  [BarberStatus.Enabled]: { variant: "success", icon: CheckCircle2Icon },
  [BarberStatus.Disabled]: { variant: "outline", icon: CircleSlashIcon },
  [BarberStatus.Rejected]: { variant: "destructive", icon: XCircleIcon },
};
