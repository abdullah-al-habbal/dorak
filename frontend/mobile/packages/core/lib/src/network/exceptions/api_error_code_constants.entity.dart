/// Every `code` the apps read from an API failure. The first group mirrors the
/// backend `ErrorCodeEnum`; feature codes are returned by single endpoints.
class ApiErrorCodeConstants {
  const ApiErrorCodeConstants._();

  // Backend generic codes.
  static const String apiErrorCodeBadRequest = 'BAD_REQUEST';
  static const String apiErrorCodeValidationFailed = 'VALIDATION_FAILED';
  static const String apiErrorCodeUnauthorized = 'UNAUTHORIZED';
  static const String apiErrorCodeForbidden = 'FORBIDDEN';
  static const String apiErrorCodeResourceNotFound = 'RESOURCE_NOT_FOUND';
  static const String apiErrorCodeMethodNotAllowed = 'METHOD_NOT_ALLOWED';
  static const String apiErrorCodeConflict = 'CONFLICT';
  static const String apiErrorCodePayloadTooLarge = 'PAYLOAD_TOO_LARGE';
  static const String apiErrorCodeUnprocessableEntity = 'UNPROCESSABLE_ENTITY';
  static const String apiErrorCodeTooManyRequests = 'TOO_MANY_REQUESTS';
  static const String apiErrorCodeServerError = 'SERVER_ERROR';
  static const String apiErrorCodeServiceUnavailable = 'SERVICE_UNAVAILABLE';
  static const String apiErrorCodeAccountNotActive = 'ACCOUNT_NOT_ACTIVE';
  static const String apiErrorCodeAccountBanned = 'ACCOUNT_BANNED';
  static const String apiErrorCodeTokenAbilityMissing = 'TOKEN_ABILITY_MISSING';

  // Made by the client, never sent by the backend.
  static const String apiErrorCodeNetworkError = 'NETWORK_ERROR';

  /// The response was not the expected API envelope.
  static const String apiErrorCodeInvalidResponse = 'INVALID_RESPONSE';

  /// The envelope carried no code.
  static const String apiErrorCodeUnknown = 'UNKNOWN';

  // Feature codes.
  static const String apiErrorCodeChairHasActiveBookings =
      'CHAIR_HAS_ACTIVE_BOOKINGS';
  static const String apiErrorCodeFeatureNotEnabled = 'feature_not_enabled';
  static const String apiErrorCodeBrandNotApproved = 'brand_not_approved';
  static const String apiErrorCodeBrandSuspended = 'brand_suspended';
  static const String apiErrorCodeAccountHasActiveBookings =
      'ACCOUNT_HAS_ACTIVE_BOOKINGS';
  static const String apiErrorCodeAccountHasActiveAffiliation =
      'ACCOUNT_HAS_ACTIVE_AFFILIATION';
  static const String apiErrorCodeBookingOutsideSchedule =
      'booking_outside_schedule';
  static const String apiErrorCodeAtHomeBarberRequired =
      'at_home_barber_required';
  static const String apiErrorCodeAtHomeServiceNotEligible =
      'at_home_service_not_eligible';
  static const String apiErrorCodeAtHomeNotOffered = 'at_home_not_offered';
  static const String apiErrorCodeAtHomeOutOfRadius = 'at_home_out_of_radius';
  static const String apiErrorCodeFacePhotoLimitReached =
      'face_photo_limit_reached';

  /// Codes that say no more than the HTTP status does. Any other code names a
  /// business rule.
  static const Set<String> apiGenericErrorCodes = {
    apiErrorCodeBadRequest,
    apiErrorCodeValidationFailed,
    apiErrorCodeUnauthorized,
    apiErrorCodeForbidden,
    apiErrorCodeResourceNotFound,
    apiErrorCodeMethodNotAllowed,
    apiErrorCodeConflict,
    apiErrorCodePayloadTooLarge,
    apiErrorCodeUnprocessableEntity,
    apiErrorCodeTooManyRequests,
    apiErrorCodeServerError,
    apiErrorCodeServiceUnavailable,
    apiErrorCodeAccountNotActive,
    apiErrorCodeAccountBanned,
    apiErrorCodeTokenAbilityMissing,
    apiErrorCodeNetworkError,
    apiErrorCodeInvalidResponse,
    apiErrorCodeUnknown,
  };
}
