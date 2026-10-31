<?php

declare(strict_types=1);

namespace Modules\Settings\Enums;

use Modules\Settings\Constants\SettingsConstants;

/** Every admin-editable integer setting; defaults and bounds live in SettingsConstants. */
enum SettingKey: string
{
    case UploadPortfolioMaxKb = 'upload_portfolio_max_kb';
    case UploadFacePhotoMaxKb = 'upload_face_photo_max_kb';
    case FaceProfileMaxPhotos = 'face_profile_max_photos';
    case FaceProfileRetentionDays = 'face_profile_retention_days';
    case NotificationRetentionDays = 'notification_retention_days';
    case ClientEmailVerificationMaxAttempts = 'client_email_verification_max_attempts';
    case ClientPhoneOtpMaxAttempts = 'client_phone_otp_max_attempts';
    case ClientPasswordResetMaxAttempts = 'client_password_reset_max_attempts';
    case ClientPasswordResetTtlMinutes = 'client_password_reset_ttl_minutes';
    case BarberEmailVerificationMaxAttempts = 'barber_email_verification_max_attempts';
    case BarberEmailVerificationTtlMinutes = 'barber_email_verification_ttl_minutes';
    case DashboardEmailChangeMaxAttempts = 'dashboard_email_change_max_attempts';
    case DashboardSessionTtlSeconds = 'dashboard_session_ttl_seconds';
    case DashboardRefreshTtlSeconds = 'dashboard_refresh_ttl_seconds';
    case BookingMinServiceDurationMinutes = 'booking_min_service_duration_minutes';
    case ReviewDisputeWindowHours = 'review_dispute_window_hours';
    case ExploreCandidateCap = 'explore_candidate_cap';
    case PaginationDefaultPerPage = 'pagination_default_per_page';
    case PaginationMaxPerPage = 'pagination_max_per_page';
    case FloorPlanMaxDecorations = 'floor_plan_max_decorations';
    case FloorPlanMaxCanvasSize = 'floor_plan_max_canvas_size';
    case FloorPlanMaxLabelLength = 'floor_plan_max_label_length';
    case SubscriptionGraceDays = 'subscription_grace_days';

    public function group(): SettingGroup
    {
        return match ($this) {
            self::UploadPortfolioMaxKb => SettingGroup::Media,
            self::UploadFacePhotoMaxKb => SettingGroup::Media,
            self::FaceProfileMaxPhotos => SettingGroup::Media,
            self::FaceProfileRetentionDays => SettingGroup::Media,
            self::NotificationRetentionDays => SettingGroup::Media,
            self::ClientEmailVerificationMaxAttempts => SettingGroup::Auth,
            self::ClientPhoneOtpMaxAttempts => SettingGroup::Auth,
            self::ClientPasswordResetMaxAttempts => SettingGroup::Auth,
            self::ClientPasswordResetTtlMinutes => SettingGroup::Auth,
            self::BarberEmailVerificationMaxAttempts => SettingGroup::Auth,
            self::BarberEmailVerificationTtlMinutes => SettingGroup::Auth,
            self::DashboardEmailChangeMaxAttempts => SettingGroup::Auth,
            self::DashboardSessionTtlSeconds => SettingGroup::Auth,
            self::DashboardRefreshTtlSeconds => SettingGroup::Auth,
            self::BookingMinServiceDurationMinutes => SettingGroup::Booking,
            self::ReviewDisputeWindowHours => SettingGroup::Booking,
            self::ExploreCandidateCap => SettingGroup::Search,
            self::PaginationDefaultPerPage => SettingGroup::Search,
            self::PaginationMaxPerPage => SettingGroup::Search,
            self::FloorPlanMaxDecorations => SettingGroup::FloorPlan,
            self::FloorPlanMaxCanvasSize => SettingGroup::FloorPlan,
            self::FloorPlanMaxLabelLength => SettingGroup::FloorPlan,
            self::SubscriptionGraceDays => SettingGroup::Billing,
        };
    }

    public function default(): int
    {
        return match ($this) {
            self::UploadPortfolioMaxKb => SettingsConstants::SETTING_UPLOAD_PORTFOLIO_MAX_KB_DEFAULT,
            self::UploadFacePhotoMaxKb => SettingsConstants::SETTING_UPLOAD_FACE_PHOTO_MAX_KB_DEFAULT,
            self::FaceProfileMaxPhotos => SettingsConstants::SETTING_FACE_PROFILE_MAX_PHOTOS_DEFAULT,
            self::FaceProfileRetentionDays => SettingsConstants::SETTING_FACE_PROFILE_RETENTION_DAYS_DEFAULT,
            self::NotificationRetentionDays => SettingsConstants::SETTING_NOTIFICATION_RETENTION_DAYS_DEFAULT,
            self::ClientEmailVerificationMaxAttempts => SettingsConstants::SETTING_VERIFICATION_MAX_ATTEMPTS_DEFAULT,
            self::ClientPhoneOtpMaxAttempts => SettingsConstants::SETTING_VERIFICATION_MAX_ATTEMPTS_DEFAULT,
            self::ClientPasswordResetMaxAttempts => SettingsConstants::SETTING_VERIFICATION_MAX_ATTEMPTS_DEFAULT,
            self::ClientPasswordResetTtlMinutes => SettingsConstants::SETTING_VERIFICATION_CODE_TTL_MINUTES_DEFAULT,
            self::BarberEmailVerificationMaxAttempts => SettingsConstants::SETTING_VERIFICATION_MAX_ATTEMPTS_DEFAULT,
            self::BarberEmailVerificationTtlMinutes => SettingsConstants::SETTING_VERIFICATION_CODE_TTL_MINUTES_DEFAULT,
            self::DashboardEmailChangeMaxAttempts => SettingsConstants::SETTING_VERIFICATION_MAX_ATTEMPTS_DEFAULT,
            self::DashboardSessionTtlSeconds => SettingsConstants::SETTING_DASHBOARD_SESSION_TTL_SECONDS_DEFAULT,
            self::DashboardRefreshTtlSeconds => SettingsConstants::SETTING_DASHBOARD_REFRESH_TTL_SECONDS_DEFAULT,
            self::BookingMinServiceDurationMinutes => SettingsConstants::SETTING_BOOKING_MIN_SERVICE_DURATION_MINUTES_DEFAULT,
            self::ReviewDisputeWindowHours => SettingsConstants::SETTING_REVIEW_DISPUTE_WINDOW_HOURS_DEFAULT,
            self::ExploreCandidateCap => SettingsConstants::SETTING_EXPLORE_CANDIDATE_CAP_DEFAULT,
            self::PaginationDefaultPerPage => SettingsConstants::SETTING_PAGINATION_DEFAULT_PER_PAGE_DEFAULT,
            self::PaginationMaxPerPage => SettingsConstants::SETTING_PAGINATION_MAX_PER_PAGE_DEFAULT,
            self::FloorPlanMaxDecorations => SettingsConstants::SETTING_FLOOR_PLAN_MAX_DECORATIONS_DEFAULT,
            self::FloorPlanMaxCanvasSize => SettingsConstants::SETTING_FLOOR_PLAN_MAX_CANVAS_SIZE_DEFAULT,
            self::FloorPlanMaxLabelLength => SettingsConstants::SETTING_FLOOR_PLAN_MAX_LABEL_LENGTH_DEFAULT,
            self::SubscriptionGraceDays => SettingsConstants::SETTING_SUBSCRIPTION_GRACE_DAYS_DEFAULT,
        };
    }

    public function min(): int
    {
        return match ($this) {
            self::UploadPortfolioMaxKb => SettingsConstants::SETTING_UPLOAD_PORTFOLIO_MAX_KB_MIN,
            self::UploadFacePhotoMaxKb => SettingsConstants::SETTING_UPLOAD_FACE_PHOTO_MAX_KB_MIN,
            self::FaceProfileMaxPhotos => SettingsConstants::SETTING_FACE_PROFILE_MAX_PHOTOS_MIN,
            self::FaceProfileRetentionDays => SettingsConstants::SETTING_FACE_PROFILE_RETENTION_DAYS_MIN,
            self::NotificationRetentionDays => SettingsConstants::SETTING_NOTIFICATION_RETENTION_DAYS_MIN,
            self::ClientEmailVerificationMaxAttempts => SettingsConstants::SETTING_VERIFICATION_MAX_ATTEMPTS_MIN,
            self::ClientPhoneOtpMaxAttempts => SettingsConstants::SETTING_VERIFICATION_MAX_ATTEMPTS_MIN,
            self::ClientPasswordResetMaxAttempts => SettingsConstants::SETTING_VERIFICATION_MAX_ATTEMPTS_MIN,
            self::ClientPasswordResetTtlMinutes => SettingsConstants::SETTING_VERIFICATION_CODE_TTL_MINUTES_MIN,
            self::BarberEmailVerificationMaxAttempts => SettingsConstants::SETTING_VERIFICATION_MAX_ATTEMPTS_MIN,
            self::BarberEmailVerificationTtlMinutes => SettingsConstants::SETTING_VERIFICATION_CODE_TTL_MINUTES_MIN,
            self::DashboardEmailChangeMaxAttempts => SettingsConstants::SETTING_VERIFICATION_MAX_ATTEMPTS_MIN,
            self::DashboardSessionTtlSeconds => SettingsConstants::SETTING_DASHBOARD_SESSION_TTL_SECONDS_MIN,
            self::DashboardRefreshTtlSeconds => SettingsConstants::SETTING_DASHBOARD_REFRESH_TTL_SECONDS_MIN,
            self::BookingMinServiceDurationMinutes => SettingsConstants::SETTING_BOOKING_MIN_SERVICE_DURATION_MINUTES_MIN,
            self::ReviewDisputeWindowHours => SettingsConstants::SETTING_REVIEW_DISPUTE_WINDOW_HOURS_MIN,
            self::ExploreCandidateCap => SettingsConstants::SETTING_EXPLORE_CANDIDATE_CAP_MIN,
            self::PaginationDefaultPerPage => SettingsConstants::SETTING_PAGINATION_DEFAULT_PER_PAGE_MIN,
            self::PaginationMaxPerPage => SettingsConstants::SETTING_PAGINATION_MAX_PER_PAGE_MIN,
            self::FloorPlanMaxDecorations => SettingsConstants::SETTING_FLOOR_PLAN_MAX_DECORATIONS_MIN,
            self::FloorPlanMaxCanvasSize => SettingsConstants::SETTING_FLOOR_PLAN_MAX_CANVAS_SIZE_MIN,
            self::FloorPlanMaxLabelLength => SettingsConstants::SETTING_FLOOR_PLAN_MAX_LABEL_LENGTH_MIN,
            self::SubscriptionGraceDays => SettingsConstants::SETTING_SUBSCRIPTION_GRACE_DAYS_MIN,
        };
    }

    public function max(): int
    {
        return match ($this) {
            self::UploadPortfolioMaxKb => SettingsConstants::SETTING_UPLOAD_PORTFOLIO_MAX_KB_MAX,
            self::UploadFacePhotoMaxKb => SettingsConstants::SETTING_UPLOAD_FACE_PHOTO_MAX_KB_MAX,
            self::FaceProfileMaxPhotos => SettingsConstants::SETTING_FACE_PROFILE_MAX_PHOTOS_MAX,
            self::FaceProfileRetentionDays => SettingsConstants::SETTING_FACE_PROFILE_RETENTION_DAYS_MAX,
            self::NotificationRetentionDays => SettingsConstants::SETTING_NOTIFICATION_RETENTION_DAYS_MAX,
            self::ClientEmailVerificationMaxAttempts => SettingsConstants::SETTING_VERIFICATION_MAX_ATTEMPTS_MAX,
            self::ClientPhoneOtpMaxAttempts => SettingsConstants::SETTING_VERIFICATION_MAX_ATTEMPTS_MAX,
            self::ClientPasswordResetMaxAttempts => SettingsConstants::SETTING_VERIFICATION_MAX_ATTEMPTS_MAX,
            self::ClientPasswordResetTtlMinutes => SettingsConstants::SETTING_VERIFICATION_CODE_TTL_MINUTES_MAX,
            self::BarberEmailVerificationMaxAttempts => SettingsConstants::SETTING_VERIFICATION_MAX_ATTEMPTS_MAX,
            self::BarberEmailVerificationTtlMinutes => SettingsConstants::SETTING_VERIFICATION_CODE_TTL_MINUTES_MAX,
            self::DashboardEmailChangeMaxAttempts => SettingsConstants::SETTING_VERIFICATION_MAX_ATTEMPTS_MAX,
            self::DashboardSessionTtlSeconds => SettingsConstants::SETTING_DASHBOARD_SESSION_TTL_SECONDS_MAX,
            self::DashboardRefreshTtlSeconds => SettingsConstants::SETTING_DASHBOARD_REFRESH_TTL_SECONDS_MAX,
            self::BookingMinServiceDurationMinutes => SettingsConstants::SETTING_BOOKING_MIN_SERVICE_DURATION_MINUTES_MAX,
            self::ReviewDisputeWindowHours => SettingsConstants::SETTING_REVIEW_DISPUTE_WINDOW_HOURS_MAX,
            self::ExploreCandidateCap => SettingsConstants::SETTING_EXPLORE_CANDIDATE_CAP_MAX,
            self::PaginationDefaultPerPage => SettingsConstants::SETTING_PAGINATION_DEFAULT_PER_PAGE_MAX,
            self::PaginationMaxPerPage => SettingsConstants::SETTING_PAGINATION_MAX_PER_PAGE_MAX,
            self::FloorPlanMaxDecorations => SettingsConstants::SETTING_FLOOR_PLAN_MAX_DECORATIONS_MAX,
            self::FloorPlanMaxCanvasSize => SettingsConstants::SETTING_FLOOR_PLAN_MAX_CANVAS_SIZE_MAX,
            self::FloorPlanMaxLabelLength => SettingsConstants::SETTING_FLOOR_PLAN_MAX_LABEL_LENGTH_MAX,
            self::SubscriptionGraceDays => SettingsConstants::SETTING_SUBSCRIPTION_GRACE_DAYS_MAX,
        };
    }
}
