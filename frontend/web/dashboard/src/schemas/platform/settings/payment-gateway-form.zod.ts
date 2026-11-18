import { z } from "zod";

import { GATEWAY_CODE_PATTERN, GATEWAY_NAME_MAX, GATEWAY_SORT_MAX } from "@/config/platform/payment-gateway.constant";
import { nameField } from "@/schemas/fields/name-field.zod";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

export function createPaymentGatewayFormSchema(messages: Dictionary["settings"]["gateways"]["form"]) {
  return z
    .object({
      code: z.string().regex(GATEWAY_CODE_PATTERN, messages.required),
      name_en: nameField(GATEWAY_NAME_MAX, messages.required),
      name_ar: nameField(GATEWAY_NAME_MAX, messages.required),
      driver: z.string(),
      sort: z.string().refine((text) => Number.isInteger(Number(text)) && Number(text) >= 0 && Number(text) <= GATEWAY_SORT_MAX, messages.invalidSort),
      is_active: z.boolean(),
      is_default: z.boolean(),
      /** Write-only credentials; rows with a blank key are ignored. */
      rows: z.array(z.object({ key: z.string(), value: z.string() })),
    })
    .refine(
      (values) => {
        const keys = values.rows.map((row) => row.key.trim()).filter((key) => key !== "");
        return new Set(keys).size === keys.length;
      },
      { message: messages.duplicateKey, path: ["rows"] },
    );
}
