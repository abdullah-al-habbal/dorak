import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';

class StepHeading extends StatelessWidget {
  const StepHeading({super.key, required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final colors = DorakColors.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          title,
          style: DorakTypography.headlineLgMobile.copyWith(
            color: colors.onSurface,
          ),
        ),
        const SizedBox(height: DorakDimensions.spacingSmall),
        Text(
          subtitle,
          style: DorakTypography.bodyLg.copyWith(
            color: colors.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: DorakDimensions.spacingLarge),
      ],
    );
  }
}
