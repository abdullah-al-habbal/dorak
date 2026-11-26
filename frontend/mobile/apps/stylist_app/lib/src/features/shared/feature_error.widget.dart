import 'package:feature_error_feedback/feature_error_feedback.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

/// The shared inline error with this app's default message.
class FeatureError extends StatelessWidget {
  const FeatureError({super.key, required this.error, this.fallbackMessage});

  final Object error;
  final String? fallbackMessage;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return InlineError(
      error: error,
      fallbackMessage: fallbackMessage ?? l10n.stylistUpdateFailed,
    );
  }
}
