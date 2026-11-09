/** Shared person-field limits; they mirror the backend stylist, walk-in and service requests. */
export const NAME_MAX_LENGTH = 120;
export const EMAIL_MAX_LENGTH = 255;
export const PHONE_MAX_LENGTH = 30;
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 255;
/** A reset-link token as the backend accepts it (64 characters issued, 255 allowed). */
export const RESET_TOKEN_MAX_LENGTH = 255;
/** The email-change confirmation code length. */
export const EMAIL_CODE_LENGTH = 6;
/** The dashboard display name, as UpdateDashboardProfileRequest accepts it. */
export const DISPLAY_NAME_MAX_LENGTH = 255;
