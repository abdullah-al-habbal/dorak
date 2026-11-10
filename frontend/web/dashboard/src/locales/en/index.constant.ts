import { enAnalytics } from "@/locales/en/analytics.constant";
import { enSettings } from "@/locales/en/settings.constant";
import { enAdminPayouts } from "@/locales/en/admin-payouts.constant";
import { enClients } from "@/locales/en/clients.constant";
import { enBranchOversight } from "@/locales/en/branch-oversight.constant";
import { enBarberApprovals } from "@/locales/en/barber-approvals.constant";
import { enAdminUsers } from "@/locales/en/admin-users.constant";
import { enReviewModeration } from "@/locales/en/review-moderation.constant";
import { enAdminBrands } from "@/locales/en/admin-brands.constant";
import { enAdminCatalog } from "@/locales/en/admin-catalog.constant";
import { enAdminSubscriptions } from "@/locales/en/admin-subscriptions.constant";
import { enPlans } from "@/locales/en/plans.constant";
import { enAccount } from "@/locales/en/account.constant";
import { enAuth } from "@/locales/en/auth.constant";
import { enRegisterBusiness } from "@/locales/en/register-business.constant";
import { enPasswordReset } from "@/locales/en/password-reset.constant";
import { enBranches } from "@/locales/en/branches.constant";
import { enBookings } from "@/locales/en/bookings.constant";
import { enChairs } from "@/locales/en/chairs.constant";
import { enCommon } from "@/locales/en/common.constant";
import { enEarnings } from "@/locales/en/earnings.constant";
import { enErrors } from "@/locales/en/errors.constant";
import { enStylists } from "@/locales/en/stylists.constant";
import { enServices } from "@/locales/en/services.constant";
import { enPayouts } from "@/locales/en/payouts.constant";
import { enReviews } from "@/locales/en/reviews.constant";
import { enSchedule } from "@/locales/en/schedule.constant";
import { enSubscription } from "@/locales/en/subscription.constant";
import { enShell } from "@/locales/en/shell.constant";
import { enWorkingHours } from "@/locales/en/working-hours.constant";

export const enDictionary = {
  common: enCommon,
  auth: enAuth,
  passwordReset: enPasswordReset,
  registerBusiness: enRegisterBusiness,
  account: enAccount,
  bookings: enBookings,
  shell: enShell,
  chairs: enChairs,
  branches: enBranches,
  payouts: enPayouts,
  adminPayouts: enAdminPayouts,
  plans: enPlans,
  adminSubscriptions: enAdminSubscriptions,
  adminBrands: enAdminBrands,
  reviewModeration: enReviewModeration,
  adminUsers: enAdminUsers,
  barberApprovals: enBarberApprovals,
  branchOversight: enBranchOversight,
  clients: enClients,
  adminCatalog: enAdminCatalog,
  reviews: enReviews,
  schedule: enSchedule,
  subscription: enSubscription,
  stylists: enStylists,
  services: enServices,
  workingHours: enWorkingHours,
  analytics: enAnalytics,
  settings: enSettings,
  earnings: enEarnings,
  errors: enErrors,
} as const;
