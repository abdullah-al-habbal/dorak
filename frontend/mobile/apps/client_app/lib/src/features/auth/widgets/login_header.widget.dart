import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class LoginHeader extends StatelessWidget {
  const LoginHeader({super.key, required this.animation});
  final Animation<double> animation;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    return FadeTransition(
      opacity: animation,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.loginTitle,
            style: DorakTypography.headlineLgMobile.copyWith(
              color: colors.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            l10n.loginSubtitle,
            style: DorakTypography.bodyLg.copyWith(
              color: colors.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}
