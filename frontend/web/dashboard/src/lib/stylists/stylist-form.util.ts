import type { StylistPayload } from "@/interfaces/stylists/stylist-payload.interface";
import type { StylistFormValues } from "@/schemas/stylists/stylist-form.zod";
import type { Stylist } from "@/types/stylists/stylist.type";

export function emptyStylistForm(): StylistFormValues {
  return { name_en: "", name_ar: "", email: "", phone: "", password: "", chair_id: "" };
}

function nameIn(stylist: Stylist, locale: "en" | "ar"): string {
  const fromMap = stylist.name_translations?.[locale];
  if (fromMap) return fromMap;
  if (typeof stylist.name === "string") return stylist.name;
  return stylist.name[locale] ?? "";
}

export function stylistToForm(stylist: Stylist): StylistFormValues {
  return {
    name_en: nameIn(stylist, "en"),
    name_ar: nameIn(stylist, "ar"),
    email: stylist.email ?? "",
    phone: stylist.phone ?? "",
    password: "",
    chair_id: stylist.chair?.id ?? "",
  };
}

/** Empty strings become absent or null, so the backend never receives "" for optional fields. */
export function formToStylistPayload(values: StylistFormValues): StylistPayload {
  return {
    name: { en: values.name_en.trim(), ar: values.name_ar.trim() },
    email: values.email.trim(),
    phone: values.phone.trim() || undefined,
    password: values.password || undefined,
    chair_id: values.chair_id || null,
  };
}
