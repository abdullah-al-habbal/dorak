import { z } from "zod";

import { DISPLAY_NAME_MAX_LENGTH } from "@/config/field-limit.constant";

export function displayNameFormSchema(message: string) {
  return z.object({ display_name: z.string().trim().min(1, message).max(DISPLAY_NAME_MAX_LENGTH, message) });
}
