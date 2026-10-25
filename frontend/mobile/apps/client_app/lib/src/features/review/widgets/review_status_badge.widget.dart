import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';

class ReviewStatusBadge extends StatelessWidget {
  const ReviewStatusBadge({super.key, required this.review});

  final ReviewDto review;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    final (label, color) = switch (review.status) {
      ReviewStatus.disputed => (l10n.reviewStatusUnderReview, colors.error),
      ReviewStatus.hidden => (l10n.reviewStatusHidden, colors.outline),
      ReviewStatus.published when review.resolved => (
        l10n.reviewStatusResolved,
        colors.primary,
      ),
      _ => (l10n.reviewStatusPublished, colors.primary),
    };
    return Chip(
      label: Text(label),
      labelStyle: DorakTypography.labelMd.copyWith(color: color),
      side: BorderSide(color: color),
      backgroundColor: colors.surfaceContainerLow,
    );
  }
}
