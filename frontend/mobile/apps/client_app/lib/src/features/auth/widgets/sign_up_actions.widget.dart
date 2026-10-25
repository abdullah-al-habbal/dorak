import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/auth/auth_error.entity.dart';

class SignUpActions extends StatelessWidget {
  const SignUpActions({
    super.key,
    required this.animation,
    required this.l10n,
    required this.colors,
    required this.error,
    required this.isSubmitting,
    required this.onSubmit,
    required this.onLogInLink,
  });

  final Animation<double> animation;
  final AppLocalizations l10n;
  final DorakColors colors;
  final AuthError? error;
  final bool isSubmitting;
  final VoidCallback onSubmit;
  final VoidCallback onLogInLink;

  @override
  Widget build(BuildContext context) => FadeTransition(
    opacity: animation,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (error != null) ...[
          StatusBanner(message: error!.message),
          const SizedBox(height: 12),
        ],
        PrimaryButton(
          label: l10n.signUpButton,
          onPressed: onSubmit,
          isLoading: isSubmitting,
        ),
        const SizedBox(height: 16),
        Wrap(
          alignment: WrapAlignment.center,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            Text(
              l10n.signUpAlreadyHaveAccount,
              style: DorakTypography.bodyMd.copyWith(
                color: colors.onSurfaceVariant,
              ),
            ),
            TextButton(
              onPressed: isSubmitting ? null : onLogInLink,
              style: TextButton.styleFrom(
                foregroundColor: colors.primary,
                textStyle: DorakTypography.labelLg,
                padding: const EdgeInsets.symmetric(horizontal: 8),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Text(l10n.signUpLogInLink),
            ),
          ],
        ),
      ],
    ),
  );
}
