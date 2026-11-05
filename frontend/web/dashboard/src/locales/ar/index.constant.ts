import { arAuth } from "@/locales/ar/auth.constant";
import { arBookings } from "@/locales/ar/bookings.constant";
import { arCommon } from "@/locales/ar/common.constant";
import { arErrors } from "@/locales/ar/errors.constant";
import { arShell } from "@/locales/ar/shell.constant";
import type { Dictionary } from "@/types/dictionary.type";

export const arDictionary: Dictionary = {
  common: arCommon,
  auth: arAuth,
  bookings: arBookings,
  shell: arShell,
  errors: arErrors,
};
