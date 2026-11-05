import { CheckCircle2Icon, CircleDashedIcon, CircleSlashIcon, PlayCircleIcon, UserXIcon, ClockIcon } from "lucide-react";

import { BookingStatus } from "@/enums/booking-status.enum";
import type { BookingStatusStyle } from "@/interfaces/booking-status-style.interface";

export const BOOKING_STATUS_STYLE: Record<BookingStatus, BookingStatusStyle> = {
  [BookingStatus.Pending]: { variant: "warning", icon: ClockIcon },
  [BookingStatus.Confirmed]: { variant: "info", icon: CircleDashedIcon },
  [BookingStatus.InProgress]: { variant: "info", icon: PlayCircleIcon },
  [BookingStatus.Completed]: { variant: "success", icon: CheckCircle2Icon },
  [BookingStatus.Cancelled]: { variant: "destructive", icon: CircleSlashIcon },
  [BookingStatus.NoShow]: { variant: "outline", icon: UserXIcon },
};
