import { z } from "zod";

export const ProfileSchema = z.object({
  displayName: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  pendingEmail: z.string().nullable(),
});

export const NotificationPreferencesSchema = z.object({
  emailEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  bookingEnabled: z.boolean(),
  systemEnabled: z.boolean(),
});

export const SettingsSchema = z.object({
  preferredLanguage: z.enum(["en", "ar"]).nullable(),
  isNotificationEnabled: z.boolean(),
  displayCurrencyCode: z.string().nullable(),
  theme: z.enum(["light", "dark"]).nullable(),
  priceDisplayMode: z.enum(["tax_inclusive", "tax_exclusive"]).nullable(),
});

export const UpdateProfileInputSchema = z.object({
  displayName: z.string().optional(),
  phone: z.string().optional(),
});

export const UpdatePasswordInputSchema = z.object({
  currentPassword: z.string(),
  password: z.string(),
  passwordConfirmation: z.string(),
});

export const UpdateSettingsInputSchema = z.object({
  preferredLanguage: z.enum(["en", "ar"]).nullable().optional(),
  isNotificationEnabled: z.boolean().optional(),
  displayCurrencyCode: z.string().nullable().optional(),
  theme: z.enum(["light", "dark"]).nullable().optional(),
  priceDisplayMode: z
    .enum(["tax_inclusive", "tax_exclusive"])
    .nullable()
    .optional(),
});

export const ChangeEmailInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const VerifyEmailInputSchema = z.object({
  token: z.string(),
});

export const DashboardOverviewSchema = z.object({
  activeChairsCount: z.number(),
  activeBranchesCount: z.number(),
  bookingsCount: z.number(),
  completedBookingsCount: z.number(),
  revenue: z.number(),
  revenueCurrency: z.string().nullable(),
  stylistsCount: z.number(),
  todayBookingsCount: z.number(),
});
