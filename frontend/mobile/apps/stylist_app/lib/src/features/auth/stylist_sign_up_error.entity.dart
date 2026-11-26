import 'package:feature_error_feedback/feature_error_feedback.dart';
import 'package:localization/localization.dart';

class StylistSignUpError {
  StylistSignUpError._();

  static String message(Object error, AppLocalizations l10n) {
    final apiError = ErrorFeedback.from(
      error,
      l10n,
      showsFieldMessagesInBanner: true,
    );
    if (apiError.errorsFor('email') != null) {
      return l10n.stylistSignUpEmailTaken;
    }
    if (apiError.errorsFor('code') != null) {
      return l10n.verifyErrorInvalid;
    }
    return apiError.message;
  }
}
