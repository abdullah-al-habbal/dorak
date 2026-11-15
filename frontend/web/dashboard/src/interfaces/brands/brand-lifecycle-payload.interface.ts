import type { BrandLifecycleAction } from "@/enums/venue/brand-lifecycle-action.enum";

export interface BrandLifecyclePayload {
  id: string;
  action: BrandLifecycleAction;
  reason?: string;
  cancelFutureBookings?: boolean;
}
