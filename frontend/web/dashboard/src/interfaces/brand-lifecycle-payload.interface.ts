import type { BrandLifecycleAction } from "@/enums/brand-lifecycle-action.enum";

export interface BrandLifecyclePayload {
  id: string;
  action: BrandLifecycleAction;
  reason?: string;
  cancelFutureBookings?: boolean;
}
