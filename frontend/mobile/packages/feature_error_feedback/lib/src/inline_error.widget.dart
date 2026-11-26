import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:feature_error_feedback/src/error_feedback.provider.dart';

/// A failed action shown in place, announced to assistive technology.
class InlineError extends StatelessWidget {
  const InlineError({
    super.key,
    required this.error,
    this.fallbackMessage,
    this.message,
  });

  final Object error;
  final String? fallbackMessage;

  /// An app's own wording for this failure; replaces the mapped message.
  final String? message;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Semantics(
      container: true,
      liveRegion: true,
      child: Padding(
        padding: const EdgeInsets.symmetric(
          vertical: DorakDimensions.spacingSmall,
        ),
        child: StatusBanner(
          message:
              message ??
              ErrorFeedback.from(
                error,
                l10n,
                fallbackMessage: fallbackMessage,
                showsFieldMessagesInBanner: true,
              ).message,
        ),
      ),
    );
  }
}
