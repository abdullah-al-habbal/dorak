import 'package:core/core.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/core/errors/api_error.entity.dart';

/// Turns an owner API failure into a message. A pending brand has the D11 limits
/// (`brand_not_approved`) and a suspended brand is read-only (`brand_suspended`).
class OwnerError {
  const OwnerError._();

  static const notApprovedCode =
      ApiErrorCodeConstants.apiErrorCodeBrandNotApproved;
  static const suspendedCode = ApiErrorCodeConstants.apiErrorCodeBrandSuspended;

  static String message(AppLocalizations l10n, Object error) {
    if (error is ApiException && error is! NetworkException) {
      if (error.code == notApprovedCode) return l10n.ownerErrorBrandNotApproved;
      if (error.code == suspendedCode) return l10n.ownerErrorReadOnly;
      if (error is FeatureNotEnabledException) {
        return l10n.businessFeatureNotEnabled;
      }
    }
    return ApiError.from(
      error,
      l10n,
      fallbackMessage: l10n.businessUpdateFailed,
    ).message;
  }
}
