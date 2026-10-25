import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/auth/auth_error.entity.dart';

class VerificationActions extends StatelessWidget {
  const VerificationActions({
    super.key,
    required this.error,
    required this.l10n,
    required this.colors,
    required this.busy,
    required this.cooldown,
    required this.onVerify,
    required this.onResend,
    required this.onSkip,
  });

  final AuthError? error;
  final AppLocalizations l10n;
  final DorakColors colors;
  final bool busy;
  final int cooldown;
  final VoidCallback onVerify;
  final VoidCallback onResend;
  final VoidCallback onSkip;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      SizedBox(
        height: 24,
        child: error == null ? null : StatusBanner(message: error!.message),
      ),
      const SizedBox(height: 8),
      PrimaryButton(
        label: l10n.verifyButton,
        onPressed: onVerify,
        isLoading: busy,
      ),
      const SizedBox(height: 12),
      Wrap(
        alignment: WrapAlignment.center,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          Text(
            l10n.verifyDidNotReceive,
            style: DorakTypography.bodyMd.copyWith(
              color: colors.onSurfaceVariant,
            ),
          ),
          TextButton(
            onPressed: (cooldown > 0 || busy) ? null : onResend,
            style: TextButton.styleFrom(
              foregroundColor: colors.primary,
              textStyle: DorakTypography.labelLg,
              padding: const EdgeInsets.symmetric(horizontal: 8),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Text(
              cooldown > 0
                  ? l10n.verifyResendDisabled(cooldown)
                  : l10n.verifyResend,
            ),
          ),
        ],
      ),
      const SizedBox(height: 4),
      SkipButton(label: l10n.verifySkip, onPressed: onSkip, isDisabled: busy),
    ],
  );
}
