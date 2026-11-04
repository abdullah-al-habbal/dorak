import 'package:core/core.dart';
import 'package:flutter/material.dart';

import 'package:design_system/design_system.dart';
import 'package:localization/localization.dart';

class SocialLoginButtons extends StatelessWidget {
  final bool Function(SocialAuthProvider provider) isSupported;
  final bool isBusy;
  final ValueChanged<SocialAuthProvider> onPressed;

  const SocialLoginButtons({
    super.key,
    required this.isSupported,
    required this.isBusy,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    final providers = SocialAuthProvider.values.where(isSupported).toList();
    if (providers.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            const Expanded(child: Divider()),
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: DorakDimensions.spacingMedium,
              ),
              child: Text(
                l10n.socialLoginDivider,
                style: DorakTypography.bodyMd.copyWith(
                  color: colors.onSurfaceVariant,
                ),
              ),
            ),
            const Expanded(child: Divider()),
          ],
        ),
        for (final provider in providers) ...[
          const SizedBox(height: DorakDimensions.spacingCozy),
          SecondaryButton(
            label: switch (provider) {
              SocialAuthProvider.google => l10n.socialLoginGoogle,
              SocialAuthProvider.apple => l10n.socialLoginApple,
            },
            isDisabled: isBusy,
            onPressed: () => onPressed(provider),
          ),
        ],
      ],
    );
  }
}
