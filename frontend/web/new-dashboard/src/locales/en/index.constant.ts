import { enAuth } from "@/locales/en/auth.constant";
import { enBookings } from "@/locales/en/bookings.constant";
import { enCommon } from "@/locales/en/common.constant";
import { enErrors } from "@/locales/en/errors.constant";
import { enShell } from "@/locales/en/shell.constant";

export const enDictionary = {
  common: enCommon,
  auth: enAuth,
  bookings: enBookings,
  shell: enShell,
  errors: enErrors,
} as const;
