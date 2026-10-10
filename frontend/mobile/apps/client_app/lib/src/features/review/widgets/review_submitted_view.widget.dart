import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';

import 'package:client_app/src/features/review/widgets/review_status_badge.widget.dart';

class ReviewSubmittedView extends StatelessWidget {
  const ReviewSubmittedView({
    super.key,
    required this.review,
    required this.onViewBookings,
  });

  final ReviewDto? review;
  final VoidCallback onViewBookings;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    final currentReview = review;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(DorakDimensions.marginMobile),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle_outline, size: 48, color: colors.primary),
            const SizedBox(height: DorakDimensions.spacingMedium),
            Text(l10n.reviewSubmitSuccess, style: DorakTypography.headlineMd),
            if (currentReview != null) ...[
              const SizedBox(height: DorakDimensions.spacingMedium),
              ReviewStatusBadge(review: currentReview),
              if (currentReview.disputed) ...[
                const SizedBox(height: DorakDimensions.spacingSmall),
                Text(
                  l10n.reviewDisputeHoldNote,
                  style: DorakTypography.bodyMd.copyWith(
                    color: colors.onSurfaceVariant,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ],
            const SizedBox(height: DorakDimensions.spacingLarge),
            PrimaryButton(
              label: l10n.bookingViewBookings,
              onPressed: onViewBookings,
            ),
          ],
        ),
      ),
    );
  }
}
