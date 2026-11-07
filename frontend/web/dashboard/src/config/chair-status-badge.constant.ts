import { CheckCircle2Icon, UserRoundIcon, WrenchIcon } from "lucide-react";

import { ChairStatus } from "@/enums/chair-status.enum";
import type { BookingStatusStyle } from "@/interfaces/booking-status-style.interface";

/** Status is always icon plus text, never colour alone. */
export const CHAIR_STATUS_STYLE: Record<ChairStatus, BookingStatusStyle> = {
  [ChairStatus.Available]: { variant: "success", icon: CheckCircle2Icon },
  [ChairStatus.Occupied]: { variant: "warning", icon: UserRoundIcon },
  [ChairStatus.Maintenance]: { variant: "outline", icon: WrenchIcon },
};
