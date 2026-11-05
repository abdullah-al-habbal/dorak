import { z } from "zod";

import type { Dictionary } from "@/types/dictionary.type";

const MAX_NAME = 120;
const MAX_EMAIL = 255;
const MAX_PHONE = 30;
const MIN_PASSWORD = 12;
const MAX_PASSWORD = 255;

type StylistValidation = Dictionary["stylists"]["form"]["validation"];

/** `creating` makes the password required, as the backend does. Messages come from the dictionary. */
export function createStylistSchema(messages: StylistValidation, creating: boolean) {
  const password = creating
    ? z.string().min(MIN_PASSWORD, messages.password).max(MAX_PASSWORD, messages.password)
    : z.string().max(MAX_PASSWORD, messages.password).refine((value) => value === "" || value.length >= MIN_PASSWORD, messages.password);
  return z.object({
    name_en: z.string().trim().min(1, messages.name).max(MAX_NAME, messages.name),
    name_ar: z.string().trim().min(1, messages.name).max(MAX_NAME, messages.name),
    email: z.string().trim().max(MAX_EMAIL, messages.email).pipe(z.email(messages.email)),
    phone: z.string().trim().max(MAX_PHONE),
    password,
    chair_id: z.string(),
  });
}

export type StylistFormValues = z.input<ReturnType<typeof createStylistSchema>>;
