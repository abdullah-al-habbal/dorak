import { createFieldNameMapper } from "@/lib/core/errors/apply-form-error.util";
import type { ClientRatingInput } from "@/types/clients/clients/client-rating.type";
import type { RateClientFormValues } from "@/types/clients/clients/rate-client-form-values.type";

/** A blank note is left out of the request. */
export function formToRatingInput(values: RateClientFormValues): ClientRatingInput {
  const body = values.body.trim();
  return body === "" ? { rating: values.rating } : { rating: values.rating, body };
}

export const mapRatingFieldName = createFieldNameMapper({ rating: "rating", body: "body" });
