import { z } from "zod";

import { parseLocalInput } from "@/lib/booking-datetime.util";
import type { Dictionary } from "@/types/dictionary.type";

type RescheduleValidation = Dictionary["bookings"]["reschedule"]["validation"];

export function createRescheduleSchema(messages: RescheduleValidation) {
  return z
    .object({
      starts_at: z.string().refine((value) => parseLocalInput(value) !== null, messages.start),
      ends_at: z.string().refine((value) => parseLocalInput(value) !== null, messages.end),
    })
    .refine(
      ({ starts_at, ends_at }) => {
        const start = parseLocalInput(starts_at);
        const end = parseLocalInput(ends_at);
        return start === null || end === null || end > start;
      },
      { path: ["ends_at"], message: messages.endAfterStart },
    );
}

export type RescheduleFormValues = z.input<ReturnType<typeof createRescheduleSchema>>;
