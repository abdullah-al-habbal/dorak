import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class SignUpHeader extends StatelessWidget {
  const SignUpHeader({
    super.key,
    required this.animation,
    required this.l10n,
    required this.colors,
  });

  final Animation<double> animation;
  final AppLocalizations l10n;
  final DorakColors colors;

  @override
  Widget build(BuildContext context) => FadeTransition(
    opacity: animation,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.signUpTitle,
          style: DorakTypography.headlineLgMobile.copyWith(
            color: colors.onSurface,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          l10n.signUpSubtitle,
          style: DorakTypography.bodyLg.copyWith(
            color: colors.onSurfaceVariant,
          ),
        ),
      ],
    ),
  );
}
