import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/core/errors/api_error.entity.dart';

class FeatureError extends StatelessWidget {
  const FeatureError({super.key, required this.error, this.fallbackMessage});

  final Object error;
  final String? fallbackMessage;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final message = ApiError.from(
      error,
      l10n,
      fallbackMessage: fallbackMessage ?? l10n.stylistUpdateFailed,
    ).message;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Text(
        message,
        style: TextStyle(color: Theme.of(context).colorScheme.error),
      ),
    );
  }
}
