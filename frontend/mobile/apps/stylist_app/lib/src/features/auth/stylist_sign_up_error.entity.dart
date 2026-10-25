import 'package:localization/localization.dart';

import 'package:stylist_app/src/core/errors/api_error.entity.dart';

class StylistSignUpError {
  StylistSignUpError._();

  static String message(Object error, AppLocalizations l10n) {
    final apiError = ApiError.from(error, l10n);
    if (apiError.errorsFor('email') != null) return l10n.stylistSignUpEmailTaken;
    if (apiError.errorsFor('code') != null) return l10n.verifyErrorInvalid;
    return apiError.message;
  }
}
