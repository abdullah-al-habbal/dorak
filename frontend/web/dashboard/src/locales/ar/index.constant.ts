import { arAdminPayouts } from "@/locales/ar/admin-payouts.constant";
import { arAdminSubscriptions } from "@/locales/ar/admin-subscriptions.constant";
import { arPlans } from "@/locales/ar/plans.constant";
import { arAuth } from "@/locales/ar/auth.constant";
import { arBranches } from "@/locales/ar/branches.constant";
import { arBookings } from "@/locales/ar/bookings.constant";
import { arChairs } from "@/locales/ar/chairs.constant";
import { arCommon } from "@/locales/ar/common.constant";
import { arEarnings } from "@/locales/ar/earnings.constant";
import { arErrors } from "@/locales/ar/errors.constant";
import { arStylists } from "@/locales/ar/stylists.constant";
import { arServices } from "@/locales/ar/services.constant";
import { arPayouts } from "@/locales/ar/payouts.constant";
import { arReviews } from "@/locales/ar/reviews.constant";
import { arSchedule } from "@/locales/ar/schedule.constant";
import { arSubscription } from "@/locales/ar/subscription.constant";
import { arShell } from "@/locales/ar/shell.constant";
import { arWorkingHours } from "@/locales/ar/working-hours.constant";
import type { Dictionary } from "@/types/dictionary.type";

export const arDictionary: Dictionary = {
  common: arCommon,
  auth: arAuth,
  bookings: arBookings,
  shell: arShell,
  chairs: arChairs,
  branches: arBranches,
  payouts: arPayouts,
  adminPayouts: arAdminPayouts,
  plans: arPlans,
  adminSubscriptions: arAdminSubscriptions,
  reviews: arReviews,
  schedule: arSchedule,
  subscription: arSubscription,
  stylists: arStylists,
  services: arServices,
  workingHours: arWorkingHours,
  earnings: arEarnings,
  errors: arErrors,
};
