/** The four dashboard notification switches, in the order the account page lists them. */
export const NOTIFICATION_PREFERENCE_KEYS = [
  "allows_email_notifications",
  "allows_push_notifications",
  "allows_booking_notifications",
  "allows_system_notifications",
] as const;

export const ACCOUNT_API = {
  profile: "/profile",
  emailChange: "/profile/email/change",
  emailVerify: "/profile/email/verify",
  notifications: "/profile/notifications",
  settings: "/settings",
} as const;
