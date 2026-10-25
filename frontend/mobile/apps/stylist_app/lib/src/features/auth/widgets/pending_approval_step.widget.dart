import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/auth/widgets/step_heading.widget.dart';

class PendingApprovalStep extends StatelessWidget {
  const PendingApprovalStep({
    super.key,
    required this.l10n,
    required this.onBackToLogin,
  });

  final AppLocalizations l10n;
  final VoidCallback onBackToLogin;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      StepHeading(
        title: l10n.stylistPendingTitle,
        subtitle: l10n.stylistPendingMessage,
      ),
      PrimaryButton(
        label: l10n.stylistPendingBackToLogin,
        onPressed: onBackToLogin,
      ),
    ],
  );
}
