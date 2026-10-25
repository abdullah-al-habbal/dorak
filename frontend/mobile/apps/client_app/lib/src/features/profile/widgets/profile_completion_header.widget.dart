import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class ProfileCompletionHeader extends StatelessWidget {
  const ProfileCompletionHeader({
    super.key,
    required this.l10n,
    required this.colors,
  });
  final AppLocalizations l10n;
  final DorakColors colors;

  @override
  Widget build(BuildContext context) => Column(
    children: [
      Icon(Icons.account_circle, size: 48, color: colors.primary),
      const SizedBox(height: DorakDimensions.spacingMedium),
      Text(
        l10n.profileCompletionTitle,
        style: DorakTypography.headlineLgMobile.copyWith(color: colors.primary),
        textAlign: TextAlign.center,
      ),
      const SizedBox(height: DorakDimensions.spacingSmall),
      Text(
        l10n.profileCompletionSubtitle,
        style: DorakTypography.bodyLg.copyWith(color: colors.onSurfaceVariant),
        textAlign: TextAlign.center,
      ),
    ],
  );
}
