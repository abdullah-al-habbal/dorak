import { CheckCircle2Icon, CircleSlashIcon } from "lucide-react";

import { AdminUserState } from "@/enums/access/admin-user-state.enum";
import type { BookingStatusStyle } from "@/interfaces/bookings/booking-status-style.interface";

export const ADMIN_USER_PER_PAGE = 10;
export const ADMIN_USER_MAX_SEARCH = 100;
export const ADMIN_USER_MAX_NAME = 255;
export const ADMIN_USER_MAX_EMAIL = 255;

/** Active and deactivated admins are both listed by default. */
export const DEFAULT_ADMIN_USER_STATE = AdminUserState.All;

/** Status is always icon plus text, never colour alone. */
export const ADMIN_USER_STATE_STYLE: Record<AdminUserState.Active | AdminUserState.Inactive, BookingStatusStyle> = {
  [AdminUserState.Active]: { variant: "success", icon: CheckCircle2Icon },
  [AdminUserState.Inactive]: { variant: "outline", icon: CircleSlashIcon },
};
