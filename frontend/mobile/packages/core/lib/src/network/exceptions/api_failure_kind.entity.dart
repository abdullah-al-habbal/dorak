import 'package:core/src/network/exceptions/api.exception.dart';
import 'package:core/src/network/exceptions/api_error_code_constants.entity.dart';
import 'package:core/src/network/exceptions/network.exception.dart';
import 'package:core/src/network/exceptions/validation.exception.dart';

/// What kind of failure an error is, without any user-facing wording.
enum ApiFailureKind {
  network,
  server,
  rateLimited,
  unauthorized,
  forbidden,
  conflict,
  validation,
  businessCode,
  unknown;

  /// The first match wins: no response, not an API failure, field errors, a
  /// business-rule code, then the HTTP status. A coded 409 is therefore
  /// [businessCode]; a feature that treats every 409 alike reads the status.
  static ApiFailureKind from(Object error) {
    if (error is NetworkException) return network;
    if (error is! ApiException) return unknown;
    if (error is ValidationException) return validation;
    if (!ApiErrorCodeConstants.apiGenericErrorCodes.contains(error.code)) {
      return businessCode;
    }
    return switch (error.statusCode) {
      401 => unauthorized,
      403 => forbidden,
      409 => conflict,
      422 => validation,
      429 => rateLimited,
      >= 500 => server,
      _ => unknown,
    };
  }
}
