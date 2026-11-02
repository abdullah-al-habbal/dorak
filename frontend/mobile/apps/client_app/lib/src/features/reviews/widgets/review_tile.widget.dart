import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';

import 'package:client_app/src/core/formatting/locale_formatters.entity.dart';

class ReviewTile extends StatelessWidget {
  const ReviewTile({super.key, required this.review, required this.localeCode});

  final ReviewDto review;
  final String localeCode;

  @override
  Widget build(BuildContext context) {
    final colors = DorakColors.of(context);
    final comment = review.body;
    return Container(
      padding: const EdgeInsets.all(DorakDimensions.spacingMedium),
      decoration: BoxDecoration(
        color: colors.surfaceContainerLow,
        borderRadius: DorakDimensions.radiusMd,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.star, size: 18, color: colors.primary),
              const SizedBox(width: 4),
              Text('${review.rating}', style: DorakTypography.labelLg),
              const Spacer(),
              Text(
                LocaleFormatters.date(review.createdAt.toLocal(), localeCode),
                style: DorakTypography.labelMd.copyWith(
                  color: colors.onSurfaceVariant,
                ),
              ),
            ],
          ),
          if (review.authorName != null) ...[
            const SizedBox(height: 4),
            Text(review.authorName!, style: DorakTypography.labelMd),
          ],
          if (comment != null && comment.isNotEmpty) ...[
            const SizedBox(height: DorakDimensions.spacingSmall),
            Text(comment, style: DorakTypography.bodyMd),
          ],
        ],
      ),
    );
  }
}
