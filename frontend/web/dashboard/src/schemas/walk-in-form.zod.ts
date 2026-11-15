import { z } from "zod";

import { EMAIL_MAX_LENGTH, NAME_MAX_LENGTH, PHONE_MAX_LENGTH } from "@/config/field-limit.constant";
import { parseLocalInput } from "@/lib/booking-datetime.util";
import { emailField } from "@/schemas/fields/email-field.zod";
import { nameField } from "@/schemas/fields/name-field.zod";
import { phoneField } from "@/schemas/fields/phone-field.zod";
import type { Dictionary } from "@/types/core/dictionary.type";

type WalkInValidation = Dictionary["bookings"]["walkIn"]["validation"];

/** Built per render with the dictionary so every message is localised. `now` is injectable for tests. */
export function createWalkInSchema(messages: WalkInValidation, now: () => number = Date.now) {
  return z.object({
    customer_name: nameField(NAME_MAX_LENGTH, messages.name),
    customer_email: emailField(EMAIL_MAX_LENGTH, messages.email),
    customer_phone: phoneField(PHONE_MAX_LENGTH),
    chair_id: z.string().min(1, messages.chair),
    service_ids: z.array(z.string()).min(1, messages.services),
    starts_at: z.string().refine((value) => {
      const date = parseLocalInput(value);
      return date !== null && date.getTime() > now();
    }, messages.start),
  });
}

export type WalkInFormValues = z.input<ReturnType<typeof createWalkInSchema>>;
