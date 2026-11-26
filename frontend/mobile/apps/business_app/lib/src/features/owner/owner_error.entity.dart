import 'package:core/core.dart';
import 'package:feature_error_feedback/feature_error_feedback.dart';
import 'package:localization/localization.dart';

/// Turns an owner API failure into a message. A pending brand has the D11 limits
/// (`brand_not_approved`) and a suspended brand is read-only (`brand_suspended`).
class OwnerError {
  const OwnerError._();

  static String message(AppLocalizations l10n, Object error) {
    if (error is ApiException && error is! NetworkException) {
      if (error.code == ApiErrorCodeConstants.apiErrorCodeBrandNotApproved) {
        return l10n.ownerErrorBrandNotApproved;
      }
      if (error.code == ApiErrorCodeConstants.apiErrorCodeBrandSuspended) {
        return l10n.ownerErrorReadOnly;
      }
      if (error is FeatureNotEnabledException) {
        return l10n.businessFeatureNotEnabled;
      }
    }
    return ErrorFeedback.from(
      error,
      l10n,
      fallbackMessage: l10n.businessUpdateFailed,
      showsFieldMessagesInBanner: true,
    ).message;
  }
}
