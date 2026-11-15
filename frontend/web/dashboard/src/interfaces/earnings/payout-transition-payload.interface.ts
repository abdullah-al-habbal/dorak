import type { PayoutAction } from "@/enums/money/payout-action.enum";

export interface PayoutTransitionPayload {
  id: string;
  action: PayoutAction;
  /** Sent only when not empty; the backend keeps the stored value otherwise. */
  external_reference?: string;
  notes?: string;
}
