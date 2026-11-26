class ApiErrorCodeConstants {
  const ApiErrorCodeConstants._();

  static const String apiErrorCodeChairHasActiveBookings =
      'CHAIR_HAS_ACTIVE_BOOKINGS';
  static const String apiErrorCodeFeatureNotEnabled = 'feature_not_enabled';
  static const String apiErrorCodeAccountBanned = 'ACCOUNT_BANNED';
  static const String apiErrorCodeAccountNotActive = 'ACCOUNT_NOT_ACTIVE';
  static const String apiErrorCodeValidationFailed = 'VALIDATION_FAILED';
  static const String apiErrorCodeNetworkError = 'NETWORK_ERROR';
  static const String apiErrorCodeBrandNotApproved = 'brand_not_approved';
  static const String apiErrorCodeBrandSuspended = 'brand_suspended';

  /// Client-made: the response was not the expected API envelope.
  static const String apiErrorCodeInvalidResponse = 'INVALID_RESPONSE';
}
