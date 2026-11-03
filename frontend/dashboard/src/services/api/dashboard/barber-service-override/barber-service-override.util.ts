import { toMinorUnits } from "@/services/api/dashboard/monetization/monetization.util";
import type { IBarberServiceOverrideForm } from "@/services/api/dashboard/barber-service-override/types/ibarber-service-override-form.types";

/** Wire body of `PUT .../override`; a null field keeps the barber's default. */
export function barberServiceOverrideBody(
  brandId: string,
  form: IBarberServiceOverrideForm,
) {
  return {
    brand_id: brandId,
    price_amount_minor: form.price === null ? null : toMinorUnits(form.price),
    duration_minutes: form.durationMinutes,
  };
}
