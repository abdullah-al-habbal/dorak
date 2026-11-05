import { enAuth } from "@/locales/en/auth.constant";
import { enBookings } from "@/locales/en/bookings.constant";
import { enCommon } from "@/locales/en/common.constant";
import { enErrors } from "@/locales/en/errors.constant";
import { enStylists } from "@/locales/en/stylists.constant";
import { enServices } from "@/locales/en/services.constant";
import { enShell } from "@/locales/en/shell.constant";
import { enWorkingHours } from "@/locales/en/working-hours.constant";

export const enDictionary = {
  common: enCommon,
  auth: enAuth,
  bookings: enBookings,
  shell: enShell,
  stylists: enStylists,
  services: enServices,
  workingHours: enWorkingHours,
  errors: enErrors,
} as const;
