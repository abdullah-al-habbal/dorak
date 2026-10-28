import { BRAND_UNIVERSES } from "@/services/api/dashboard/brands/brands.constant";
import { BrandSchema } from "@/services/api/dashboard/brands/schemas/brands.schema";
import type { IBrand } from "@/services/api/dashboard/brands/types/ibrand.types";
import { isRecord } from "@/utils/guards.util";
import type { IBrandForm } from "@/services/api/dashboard/brands/types/ibrand-form.types";

type Wire = Record<string, unknown>;

function record(value: unknown): Wire {
  return isRecord(value) ? value : {};
}
function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}
function nullableText(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}
function localized(value: unknown) {
  const item = record(value);
  return { en: text(item.en), ar: text(item.ar) };
}
function universe(value: unknown) {
  return BRAND_UNIVERSES.find((option) => option === value) ?? "unisex";
}

export function mapBrand(wire: unknown): IBrand {
  const item = record(wire);
  const currency = record(item.base_currency);
  return BrandSchema.parse({
    id: text(item.id),
    name: localized(item.name),
    description: localized(item.description),
    logo: nullableText(item.logo),
    slug: nullableText(item.slug),
    universe: universe(item.universe),
    baseCurrencyId: nullableText(currency.id),
    baseCurrencyCode: nullableText(currency.code),
    branchesCount:
      typeof item.branches_count === "number" ? item.branches_count : 0,
  });
}

export function brandPayload(form: IBrandForm) {
  return {
    name: { en: form.nameEn, ar: form.nameAr },
    description: {
      en: form.descriptionEn === "" ? null : form.descriptionEn,
      ar: form.descriptionAr === "" ? null : form.descriptionAr,
    },
    logo: form.logo === "" ? null : form.logo,
    base_currency_id: form.baseCurrencyId,
    universe: form.universe,
  };
}
