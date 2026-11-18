import { z } from "zod";

import { BARBER_CONTACT_PATTERN, COMMISSION_MAX, COMMISSION_MIN } from "@/config/ops/invitation.constant";

interface InviteBarberFormMessages {
  pick: string;
  commissionRange: string;
}

function isPercent(value: string): boolean {
  const text = value.trim();
  if (text === "") return true;
  const percent = Number(text);
  return percent >= COMMISSION_MIN && percent <= COMMISSION_MAX;
}

/** A barber is chosen from the results, or the typed search is an exact email or phone to invite by contact. */
export function createInviteBarberFormSchema(messages: InviteBarberFormMessages) {
  return z
    .object({
      term: z.string(),
      barber_id: z.string(),
      commission: z.string().refine(isPercent, messages.commissionRange),
    })
    .superRefine((values, context) => {
      if (values.barber_id === "" && !BARBER_CONTACT_PATTERN.test(values.term.trim())) context.addIssue({ code: "custom", path: ["barber_id"], message: messages.pick });
    });
}
