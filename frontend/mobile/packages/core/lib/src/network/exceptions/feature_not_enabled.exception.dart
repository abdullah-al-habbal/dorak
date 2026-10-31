import 'package:core/src/network/exceptions/api.exception.dart';

/// A brand premium feature (`multi_branch`, `job_board`) is off, or the
/// branch is read-only after a downgrade (403 `feature_not_enabled`).
class FeatureNotEnabledException extends ApiException {
  const FeatureNotEnabledException({
    required super.statusCode,
    required super.code,
    required super.message,
    required this.feature,
  });

  static const featureNotEnabledErrorCode = 'feature_not_enabled';

  /// The feature that is required, when the server named it.
  final String? feature;
}
