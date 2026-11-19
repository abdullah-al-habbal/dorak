import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

/// Shown instead of the booking sections when a branch has nothing to book.
class BranchNotBookable extends StatelessWidget {
  const BranchNotBookable({super.key, required this.l10n});

  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(l10n.branchNotBookableTitle, style: DorakTypography.titleLg),
      const SizedBox(height: DorakDimensions.spacingSmall),
      Text(l10n.branchNotBookableMessage),
    ],
  );
}
