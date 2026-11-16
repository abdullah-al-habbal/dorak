/** The multipart field every dashboard upload uses; the proxy forwards this field and nothing else. */
export const UPLOAD_FIELD = "file";

/** Mirrors the backend's image limit (`DASHBOARD_BRAND_LOGO_MAX_KB`); the backend stays the authority. */
export const UPLOAD_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

/** Room for the multipart framing around a file at the size limit. */
export const UPLOAD_ENVELOPE_SLACK_BYTES = 64 * 1024;

export const UPLOAD_IMAGE_TYPES: readonly string[] = ["image/jpeg", "image/png", "image/webp"];
export const UPLOAD_IMAGE_ACCEPT = UPLOAD_IMAGE_TYPES.join(",");
