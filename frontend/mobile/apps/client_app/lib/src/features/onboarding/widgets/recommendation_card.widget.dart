import 'package:flutter/material.dart';

import 'package:design_system/design_system.dart';

class RecommendationCard extends StatelessWidget {
  const RecommendationCard({
    super.key,
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.labelColor,
    required this.style,
    required this.trackColor,
    required this.fillColor,
    required this.fillFactor,
  });
  final IconData icon;
  final Color iconColor;
  final String label;
  final Color labelColor;
  final String style;
  final Color trackColor;
  final Color fillColor;
  final double fillFactor;
  @override
  Widget build(BuildContext context) {
    final colors = DorakColors.of(context);
    return Container(
      width: 192,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colors.surface.withValues(alpha: 0.8),
        borderRadius: DorakDimensions.radiusLg,
        border: Border.all(color: colors.tertiaryFixed),
        boxShadow: [
          BoxShadow(
            color: colors.surfaceTint.withValues(alpha: 0.12),
            blurRadius: 32,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: iconColor, size: 16),
              const SizedBox(width: 8),
              Text(
                label,
                style: DorakTypography.labelMd.copyWith(color: labelColor),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            style,
            style: DorakTypography.titleLg.copyWith(color: colors.onSurface),
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: DorakDimensions.radiusFull,
            child: SizedBox(
              height: 4,
              width: 96,
              child: ColoredBox(
                color: trackColor,
                child: FractionallySizedBox(
                  alignment: Alignment.centerLeft,
                  widthFactor: fillFactor,
                  child: ColoredBox(color: fillColor),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
