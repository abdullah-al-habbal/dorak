/** The hidden field people never see; a bot that fills it is ignored by the backend (`OwnerRegistrationConstants::HONEYPOT_FIELD`). */
export const HONEYPOT_FIELD = "website";
/** A branch name is optional; when left empty the backend uses the brand name. */
export const BRANCH_NAME_MAX_LENGTH = 120;
export const BRAND_NAME_MAX_LENGTH = 255;
/** Seconds before the code can be asked for again, so the resend button cannot be hammered. */
export const RESEND_COOLDOWN_SECONDS = 30;
