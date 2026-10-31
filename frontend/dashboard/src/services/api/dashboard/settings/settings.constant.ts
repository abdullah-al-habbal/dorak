export const PLATFORM_SETTINGS_QUERY_KEYS = {
  all: ["dashboard", "platform-settings"],
} as const;

/** Display order of the setting groups returned by the backend SettingGroup enum. */
export const PLATFORM_SETTING_GROUPS = [
  "media",
  "auth",
  "booking",
  "search",
  "floor_plan",
] as const;

export const PLATFORM_SETTING_KEYS = [
  "upload_portfolio_max_kb",
  "upload_face_photo_max_kb",
  "face_profile_max_photos",
  "face_profile_retention_days",
  "notification_retention_days",
  "client_email_verification_max_attempts",
  "client_phone_otp_max_attempts",
  "client_password_reset_max_attempts",
  "client_password_reset_ttl_minutes",
  "barber_email_verification_max_attempts",
  "barber_email_verification_ttl_minutes",
  "dashboard_email_change_max_attempts",
  "dashboard_session_ttl_seconds",
  "dashboard_refresh_ttl_seconds",
  "booking_min_service_duration_minutes",
  "review_dispute_window_hours",
  "explore_candidate_cap",
  "pagination_default_per_page",
  "pagination_max_per_page",
  "floor_plan_max_decorations",
  "floor_plan_max_canvas_size",
  "floor_plan_max_label_length",
] as const;
