import 'package:core/core.dart';
import 'package:localization/localization.dart';

class DeleteAccountError {
  const DeleteAccountError._();

  static String message(AppLocalizations l10n, Object error) {
    if (error is NetworkException) return l10n.errorNetwork;
    if (error is! ApiException) return l10n.errorGeneric;
    if (error.code ==
        ApiErrorCodeConstants.apiErrorCodeAccountHasActiveBookings) {
      return l10n.deleteAccountActiveBookings;
    }
    if (error.isUnauthorized || error.statusCode == 422) {
      return l10n.deleteAccountWrongPassword;
    }
    return l10n.errorGeneric;
  }
}
