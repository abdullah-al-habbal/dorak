import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { AdminCurrency } from "@/types/platform/currency-admin.type";

export interface CurrencyFormOverlayRequest {
  kind: OverlayKind.CurrencyForm;
  /** Present when editing. */
  currency?: AdminCurrency;
}
