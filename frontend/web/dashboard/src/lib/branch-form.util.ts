import { LATITUDE_LIMIT, LONGITUDE_LIMIT } from "@/config/branch.constant";
import { VenueUniverse } from "@/enums/venue-universe.enum";
import type { BranchPayload } from "@/interfaces/branches/branch-payload.interface";
import { parseCoordinate } from "@/lib/coordinate.util";
import type { BranchFormValues } from "@/schemas/branch-form.zod";
import type { BranchDetail } from "@/types/branches/branch-detail.type";

export function emptyBranchForm(brandId: string): BranchFormValues {
  return {
    brand_id: brandId,
    name_en: "",
    name_ar: "",
    email: "",
    password: "",
    universe: VenueUniverse.Unisex,
    description_en: "",
    description_ar: "",
    address_en: "",
    address_ar: "",
    latitude: "",
    longitude: "",
  };
}

function coordinateText(value: number | string | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

export function branchToForm(branch: BranchDetail): BranchFormValues {
  return {
    brand_id: branch.brand_id,
    name_en: branch.name?.en ?? "",
    name_ar: branch.name?.ar ?? "",
    email: branch.email,
    password: "",
    universe: branch.universe ?? VenueUniverse.Unisex,
    description_en: branch.description?.en ?? "",
    description_ar: branch.description?.ar ?? "",
    address_en: branch.address?.en ?? "",
    address_ar: branch.address?.ar ?? "",
    latitude: coordinateText(branch.latitude),
    longitude: coordinateText(branch.longitude),
  };
}

/** Two empty translations are sent as `null`, which clears the field. */
function translations(en: string, ar: string): { en: string; ar: string } | null {
  const pair = { en: en.trim(), ar: ar.trim() };
  return pair.en === "" && pair.ar === "" ? null : pair;
}

export function formToBranchPayload(values: BranchFormValues): BranchPayload {
  const password = values.password;
  return {
    brand_id: values.brand_id,
    name: { en: values.name_en.trim(), ar: values.name_ar.trim() },
    email: values.email.trim(),
    universe: values.universe,
    description: translations(values.description_en, values.description_ar),
    address: translations(values.address_en, values.address_ar),
    latitude: parseCoordinate(values.latitude, LATITUDE_LIMIT) ?? null,
    longitude: parseCoordinate(values.longitude, LONGITUDE_LIMIT) ?? null,
    ...(password === "" ? {} : { password }),
  };
}
