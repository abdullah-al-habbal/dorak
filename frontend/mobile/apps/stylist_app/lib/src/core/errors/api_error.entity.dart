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
  }) {
    if (error is ValidationException) {
      return ApiError(
        message: fallbackMessage ?? l10n.errorGeneric,
        fieldErrors: error.errors,
      );
    }
    if (error is NetworkException) {
      return ApiError(message: networkMessage ?? l10n.errorNetwork);
    }
    if (error is ApiException) {
      if (error.code == 'ACCOUNT_NOT_ACTIVE') {
        return ApiError(message: l10n.authAccountNotActive);
      }
      if (error.code == 'ACCOUNT_BANNED') {
        return ApiError(message: l10n.authAccountSuspended);
      }
      return ApiError(message: fallbackMessage ?? l10n.errorGeneric);
    }
    return ApiError(message: fallbackMessage ?? l10n.errorGeneric);
  }

  List<String>? errorsFor(String field) => fieldErrors[field];
}
