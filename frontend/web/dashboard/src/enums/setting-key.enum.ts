/** The settings the form validates across fields; mirrors Modules\Settings\Enums\SettingKey. */
export enum SettingKey {
  PaginationDefaultPerPage = "pagination_default_per_page",
  PaginationMaxPerPage = "pagination_max_per_page",
  DashboardSessionTtlSeconds = "dashboard_session_ttl_seconds",
  DashboardRefreshTtlSeconds = "dashboard_refresh_ttl_seconds",
}
