import { minorUnitsToInput, parseMinorUnits } from "@/lib/core/money.util";
import type { ServiceOverridePayload } from "@/services/api/mutation/stylist-pricing.mutation";
import type { ServiceTerms } from "@/types/services/service-terms.type";

export interface OverrideDraft {
  price: string;
  duration: string;
}

export type OverrideDraftResult = { payload: Omit<ServiceOverridePayload, "brand_id"> } | { error: "invalid" | "nothing" };

/** The editable starting point: the terms the brand currently applies. */
export function draftFromTerms(terms: ServiceTerms): OverrideDraft {
  return { price: minorUnitsToInput(terms.price_amount_minor), duration: terms.duration_minutes == null ? "" : String(terms.duration_minutes) };
}

/** Turns the typed values into a payload; a value equal to the barber's default is sent as null, so only real differences are overrides. */
export function draftToPayload(draft: OverrideDraft, terms: ServiceTerms): OverrideDraftResult {
  const price = draft.price.trim() === "" ? null : parseMinorUnits(draft.price);
  const duration = draft.duration.trim() === "" ? null : Number(draft.duration);
  if (draft.price.trim() !== "" && price === null) return { error: "invalid" };
  if (duration !== null && (!Number.isInteger(duration) || duration < 1)) return { error: "invalid" };
  const price_amount_minor = price === null || price === terms.default_price_amount_minor ? null : price;
  const duration_minutes = duration === null || duration === terms.default_duration_minutes ? null : duration;
  if (price_amount_minor === null && duration_minutes === null) return { error: "nothing" };
  return { payload: { price_amount_minor, duration_minutes } };
}
