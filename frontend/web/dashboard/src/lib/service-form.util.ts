import { minorUnitsToInput, parseMinorUnits } from "@/lib/money.util";
import { parseDuration } from "@/lib/duration.util";
import type { ServicePayload } from "@/interfaces/service-payload.interface";
import type { ServiceFormValues } from "@/schemas/service-form.zod";
import type { Service } from "@/types/service.type";

const BRAND = "brand";

export function emptyServiceForm(currencyCode: string): ServiceFormValues {
  return { name_en: "", name_ar: "", price: "", currency_code: currencyCode, duration: "", is_at_home: false, is_active: true };
}

export function serviceToForm(service: Service): ServiceFormValues {
  const names = service.name_translations ?? (typeof service.name === "object" && service.name !== null ? service.name : {});
  const single = typeof service.name === "string" ? service.name : "";
  return {
    name_en: names.en ?? single,
    name_ar: names.ar ?? "",
    price: minorUnitsToInput(service.price_amount_minor),
    currency_code: service.currency_code,
    duration: service.duration_minutes ? String(service.duration_minutes) : "",
    is_at_home: service.is_at_home,
    is_active: service.is_active,
  };
}

/** Validated form values to the API body. `owner` carries the brand for a new service. */
export function formToServicePayload(values: ServiceFormValues, owner: Pick<ServicePayload, "serviceable_id" | "serviceable_type" | "catalog_item_id">): ServicePayload {
  return {
    ...owner,
    currency_code: values.currency_code,
    name: { en: values.name_en.trim(), ar: values.name_ar.trim() },
    price_amount_minor: parseMinorUnits(values.price) ?? 0,
    duration_minutes: parseDuration(values.duration) ?? null,
    is_active: values.is_active,
    is_at_home: values.is_at_home,
  };
}

export function newServiceOwner(brandId: string): Pick<ServicePayload, "serviceable_id" | "serviceable_type" | "catalog_item_id"> {
  return { serviceable_id: brandId, serviceable_type: BRAND, catalog_item_id: null };
}

export function existingServiceOwner(service: Service): Pick<ServicePayload, "serviceable_id" | "serviceable_type" | "catalog_item_id"> {
  return { serviceable_id: service.serviceable_id, serviceable_type: service.serviceable_type, catalog_item_id: service.catalog_item_id ?? null };
}

/** The full payload of an existing service with one flag flipped, for the PUT-only active toggle. */
export function activeTogglePayload(service: Service, active: boolean): ServicePayload {
  return formToServicePayload({ ...serviceToForm(service), is_active: active }, existingServiceOwner(service));
}
