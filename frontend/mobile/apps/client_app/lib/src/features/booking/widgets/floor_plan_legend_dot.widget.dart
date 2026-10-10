import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';

class FloorPlanLegendDot extends StatelessWidget {
  const FloorPlanLegendDot({
    super.key,
    required this.color,
    required this.label,
  });

  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(label, style: DorakTypography.labelMd),
      ],
    );
  }
}
