import { z } from "zod";

import { EMAIL_CODE_LENGTH } from "@/config/money-shell/field-limit.constant";

export function emailCodeFormSchema(message: string) {
  return z.object({ code: z.string().trim().regex(new RegExp(`^\\d{${EMAIL_CODE_LENGTH}}$`), message) });
}
