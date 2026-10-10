import 'package:flutter/material.dart';
import 'package:design_system/design_system.dart';

class GlassCard extends StatelessWidget {
  const GlassCard({super.key, required this.child});
  final Widget child;
  @override
  Widget build(BuildContext context) {
    final colors = DorakColors.of(context);
    return Container(
      width: 300,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: colors.surface.withValues(alpha: 0.8),
        borderRadius: DorakDimensions.radiusLg,
        border: Border.all(color: colors.primaryFixed.withValues(alpha: 0.5)),
        boxShadow: [
          BoxShadow(
            color: colors.surfaceTint.withValues(alpha: 0.08),
            blurRadius: 24,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: child,
    );
  }
}
