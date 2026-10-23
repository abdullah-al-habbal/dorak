import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';

class DiscoveryBarberCard extends StatelessWidget {
  const DiscoveryBarberCard({
    super.key,
    required this.barber,
    required this.ratingLabel,
    required this.freelancerLabel,
    required this.distanceLabel,
    required this.viewProfileLabel,
    this.onViewProfile,
  });

  final BarberProfileDto barber;
  final String ratingLabel;
  final String freelancerLabel;
  final String distanceLabel;
  final String viewProfileLabel;
  final VoidCallback? onViewProfile;

  @override
  Widget build(BuildContext context) {
    final colors = DorakColors.of(context);
    final viewProfile = onViewProfile;
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
              CircleAvatar(
                backgroundColor: colors.surfaceContainerHigh,
                child: Text(
                  barber.name.characters.firstOrNull ?? '?',
                  style: DorakTypography.titleLg.copyWith(
                    color: colors.onSurface,
                  ),
                ),
              ),
              const SizedBox(width: DorakDimensions.spacingMedium),
              Expanded(
                child: Text(barber.name, style: DorakTypography.titleLg),
              ),
            ],
          ),
          const SizedBox(height: DorakDimensions.spacingSmall / 2),
          Text(
            [freelancerLabel, ratingLabel, distanceLabel].join('  ·  '),
            style: DorakTypography.bodyMd.copyWith(
              color: colors.onSurfaceVariant,
            ),
          ),
          if (viewProfile != null) ...[
            const SizedBox(height: DorakDimensions.spacingMedium),
            PrimaryButton(label: viewProfileLabel, onPressed: viewProfile),
          ],
        ],
      ),
    );
  }
}
