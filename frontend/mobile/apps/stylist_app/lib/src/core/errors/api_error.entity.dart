import 'package:core/core.dart';
import 'package:localization/localization.dart';

class ApiError {
  final String message;
  final Map<String, List<String>> fieldErrors;

  const ApiError({required this.message, this.fieldErrors = const {}});

  factory ApiError.from(
    Object error,
    AppLocalizations l10n, {
    String? networkMessage,
    String? fallbackMessage,
    String? rejectedCredentialsMessage,
  }) {
    if (error is ValidationException) {
      return ApiError(
        message:
            rejectedCredentialsMessage ?? fallbackMessage ?? l10n.errorGeneric,
        fieldErrors: error.errors,
      );
    }
    if (error is NetworkException) {
      return ApiError(message: networkMessage ?? l10n.errorNetwork);
    }
    if (error is ApiException) {
      if (error.code == ApiErrorCodeConstants.apiErrorCodeAccountNotActive) {
        return ApiError(message: l10n.authAccountNotActive);
      }
      if (error.code == ApiErrorCodeConstants.apiErrorCodeAccountBanned) {
        return ApiError(message: l10n.authAccountSuspended);
      }
      if (rejectedCredentialsMessage != null &&
          (error.isUnauthorized ||
              error.isForbidden ||
              error.statusCode == 422)) {
        return ApiError(message: rejectedCredentialsMessage);
      }
      return ApiError(message: fallbackMessage ?? l10n.errorGeneric);
    }
    return ApiError(message: fallbackMessage ?? l10n.errorGeneric);
  }

  List<String>? errorsFor(String field) => fieldErrors[field];
}
