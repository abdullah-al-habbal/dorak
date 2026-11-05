import { arAuth } from "@/locales/ar/auth.constant";
import { arBookings } from "@/locales/ar/bookings.constant";
import { arCommon } from "@/locales/ar/common.constant";
import { arErrors } from "@/locales/ar/errors.constant";
import { arStylists } from "@/locales/ar/stylists.constant";
import { arServices } from "@/locales/ar/services.constant";
import { arShell } from "@/locales/ar/shell.constant";
import { arWorkingHours } from "@/locales/ar/working-hours.constant";
import type { Dictionary } from "@/types/dictionary.type";

export const arDictionary: Dictionary = {
  common: arCommon,
  auth: arAuth,
  bookings: arBookings,
  shell: arShell,
  stylists: arStylists,
  services: arServices,
  workingHours: arWorkingHours,
  errors: arErrors,
};
