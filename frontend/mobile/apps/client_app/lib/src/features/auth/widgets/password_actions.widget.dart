import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/auth/auth_error.entity.dart';

class PasswordActions extends StatelessWidget {
  const PasswordActions({
    super.key,
    required this.animation,
    required this.error,
    required this.isCodeRejected,
    required this.onReenterCode,
    required this.isSubmitting,
    required this.onSubmit,
  });
  final Animation<double> animation;
  final AuthError? error;
  final bool isCodeRejected;
  final VoidCallback onReenterCode;
  final bool isSubmitting;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return FadeTransition(
      opacity: animation,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (isCodeRejected) ...[
            const SizedBox(height: 8),
            StatusBanner(
              message: l10n.recoveryCodeRejected,
              actionLabel: l10n.recoveryReenterCode,
              onAction: onReenterCode,
            ),
          ] else if (error != null) ...[
            const SizedBox(height: 8),
            StatusBanner(message: error!.message),
          ],
          const SizedBox(height: 16),
          PrimaryButton(
            label: l10n.recoveryResetButton,
            onPressed: onSubmit,
            isLoading: isSubmitting,
          ),
        ],
      ),
    );
  }
}
