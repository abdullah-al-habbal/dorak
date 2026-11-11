import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { AdminCurrency } from "@/types/currency-admin.type";

export interface CurrencyFormOverlayRequest {
  kind: OverlayKind.CurrencyForm;
  /** Present when editing. */
  currency?: AdminCurrency;
}
