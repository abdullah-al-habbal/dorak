import { arAnalytics } from "@/locales/ar/analytics.constant";
import { arSettings } from "@/locales/ar/settings.constant";
import { arAdminPayouts } from "@/locales/ar/admin-payouts.constant";
import { arClients } from "@/locales/ar/clients.constant";
import { arBarberApprovals } from "@/locales/ar/barber-approvals.constant";
import { arAdminUsers } from "@/locales/ar/admin-users.constant";
import { arReviewModeration } from "@/locales/ar/review-moderation.constant";
import { arAdminBrands } from "@/locales/ar/admin-brands.constant";
import { arAdminCatalog } from "@/locales/ar/admin-catalog.constant";
import { arAdminSubscriptions } from "@/locales/ar/admin-subscriptions.constant";
import { arPlans } from "@/locales/ar/plans.constant";
import { arAccount } from "@/locales/ar/account.constant";
import { arAuth } from "@/locales/ar/auth.constant";
import { arRegisterBusiness } from "@/locales/ar/register-business.constant";
import { arPasswordReset } from "@/locales/ar/password-reset.constant";
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
  passwordReset: arPasswordReset,
  registerBusiness: arRegisterBusiness,
  account: arAccount,
  bookings: arBookings,
  shell: arShell,
  chairs: arChairs,
  branches: arBranches,
  payouts: arPayouts,
  adminPayouts: arAdminPayouts,
  plans: arPlans,
  adminSubscriptions: arAdminSubscriptions,
  adminBrands: arAdminBrands,
  reviewModeration: arReviewModeration,
  adminUsers: arAdminUsers,
  barberApprovals: arBarberApprovals,
  clients: arClients,
  adminCatalog: arAdminCatalog,
  reviews: arReviews,
  schedule: arSchedule,
  subscription: arSubscription,
  stylists: arStylists,
  services: arServices,
  workingHours: arWorkingHours,
  analytics: arAnalytics,
  settings: arSettings,
  earnings: arEarnings,
  errors: arErrors,
};
