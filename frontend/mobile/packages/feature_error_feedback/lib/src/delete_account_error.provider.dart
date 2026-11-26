import 'package:core/core.dart';
import 'package:localization/localization.dart';

/// Messages for a refused account deletion. A 401 or 422 here rejects the
/// submitted password.
abstract final class DeleteAccountErrorMessage {
  /// [byCode] adds the refusals only one app can receive.
  static String of(
    AppLocalizations l10n,
    Object error, {
    Map<String, String> byCode = const {},
  }) {
    if (error is NetworkException) return l10n.errorNetwork;
    if (error is! ApiException) return l10n.errorGeneric;
    final specific = byCode[error.code];
    if (specific != null) return specific;
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
