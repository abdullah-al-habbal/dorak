import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';

class BookingDetailsSection extends StatelessWidget {
  const BookingDetailsSection({
    super.key,
    required this.title,
    required this.children,
  });

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final colors = DorakColors.of(context);
    return Container(
      padding: const EdgeInsets.all(DorakDimensions.spacingMedium),
      decoration: BoxDecoration(
        color: colors.surfaceContainerLow,
        borderRadius: DorakDimensions.radiusMd,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: DorakTypography.titleLg),
          if (children.isNotEmpty) ...[
            const SizedBox(height: DorakDimensions.spacingSmall),
            ...children,
          ],
        ],
      ),
    );
  }
}
