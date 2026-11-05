import { z } from "zod";

import { parseLocalInput } from "@/lib/booking-datetime.util";
import type { Dictionary } from "@/types/dictionary.type";

const MAX_NAME = 120;
const MAX_EMAIL = 255;
const MAX_PHONE = 30;

type WalkInValidation = Dictionary["bookings"]["walkIn"]["validation"];

/** Built per render with the dictionary so every message is localised. `now` is injectable for tests. */
export function createWalkInSchema(messages: WalkInValidation, now: () => number = Date.now) {
  return z.object({
    customer_name: z.string().trim().min(1, messages.name).max(MAX_NAME, messages.name),
    customer_email: z.string().trim().max(MAX_EMAIL, messages.email).pipe(z.email(messages.email)),
    customer_phone: z.string().trim().max(MAX_PHONE),
    chair_id: z.string().min(1, messages.chair),
    service_ids: z.array(z.string()).min(1, messages.services),
    starts_at: z.string().refine((value) => {
      const date = parseLocalInput(value);
      return date !== null && date.getTime() > now();
    }, messages.start),
  });
}

export type WalkInFormValues = z.input<ReturnType<typeof createWalkInSchema>>;
