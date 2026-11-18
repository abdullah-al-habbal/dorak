import { PaymentGatewayDriver } from "@/enums/ui/payment-gateway-driver.enum";
import { createFieldNameMapper } from "@/lib/core/errors/apply-form-error.util";
import { toLocalePair } from "@/lib/core/format/locale-pair.util";
import type { PaymentGatewayPayload } from "@/services/api/mutation/platform/payment-gateway.mutation";
import type { PaymentGatewayFormValues } from "@/types/platform/settings/payment-gateway-form-values.type";
import type { PaymentGateway } from "@/types/platform/payment-gateway.type";

/** The code input accepts lowercase letters, digits and underscores only. */
export function normalizeGatewayCode(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_]/g, "");
}

/** Credentials are write-only, so an edit starts with no rows. */
export function gatewayToForm(gateway: PaymentGateway | undefined): PaymentGatewayFormValues {
  const name = toLocalePair(gateway?.name);
  return {
    code: gateway?.code ?? "",
    name_en: name.en,
    name_ar: name.ar,
    driver: gateway?.driver ?? PaymentGatewayDriver.Offline,
    sort: String(gateway?.sort_order ?? 0),
    is_active: gateway?.is_active ?? true,
    is_default: gateway?.is_default ?? false,
    rows: [],
  };
}

/** The default gateway is always active. Credentials are sent only when a row has a key, replacing the stored ones. */
export function formToGatewayPayload(values: PaymentGatewayFormValues): PaymentGatewayPayload {
  const filled = values.rows.filter((row) => row.key.trim() !== "");
  return {
    code: values.code,
    name: { en: values.name_en.trim(), ar: values.name_ar.trim() },
    driver: values.driver,
    is_active: values.is_active || values.is_default,
    is_default: values.is_default,
    sort_order: Number(values.sort),
    ...(filled.length > 0 ? { gateway_settings: Object.fromEntries(filled.map((row) => [row.key.trim(), row.value])) } : {}),
  };
}

export const mapGatewayFieldName = createFieldNameMapper({
  code: "code",
  name_en: "name_en",
  name_ar: "name_ar",
  driver: "driver",
  sort_order: "sort",
  is_active: "is_active",
  is_default: "is_default",
  gateway_settings: "rows",
});
