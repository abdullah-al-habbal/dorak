import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';

class AiFaceCard extends StatelessWidget {
  const AiFaceCard({super.key, required this.colors, required this.label});
  final DorakColors colors;
  final String label;

  @override
  Widget build(BuildContext context) => Container(
    width: 128,
    height: 128,
    decoration: BoxDecoration(
      shape: BoxShape.circle,
      color: colors.surfaceContainer,
      border: Border.all(color: colors.tertiaryFixed),
      boxShadow: [
        BoxShadow(
          color: colors.surfaceTint.withValues(alpha: 0.08),
          blurRadius: 24,
          offset: const Offset(0, 4),
        ),
      ],
    ),
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.face, color: colors.tertiaryContainer, size: 48),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: colors.tertiaryFixed.withValues(alpha: 0.3),
            borderRadius: DorakDimensions.radiusFull,
          ),
          child: Text(
            label,
            style: DorakTypography.labelMd.copyWith(
              color: colors.onSurfaceVariant,
            ),
          ),
        ),
      ],
    ),
  );
}
