import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class VerificationHeader extends StatelessWidget {
  const VerificationHeader({
    super.key,
    required this.destination,
    required this.l10n,
    required this.colors,
  });

  final String destination;
  final AppLocalizations l10n;
  final DorakColors colors;

  @override
  Widget build(BuildContext context) => Column(
    children: [
      Icon(Icons.mark_email_read, size: 48, color: colors.primary),
      const SizedBox(height: 16),
      Text(
        l10n.verifyTitle,
        style: DorakTypography.headlineSm.copyWith(color: colors.onSurface),
        textAlign: TextAlign.center,
      ),
      const SizedBox(height: 8),
      Text(
        l10n.verifySubtitle(destination),
        style: DorakTypography.bodyMd.copyWith(color: colors.onSurfaceVariant),
        textAlign: TextAlign.center,
      ),
    ],
  );
}
