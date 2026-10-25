import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';

class AiOrbitBackground extends StatelessWidget {
  const AiOrbitBackground({super.key, required this.colors});
  final DorakColors colors;

  @override
  Widget build(BuildContext context) => Stack(
    alignment: Alignment.center,
    children: [
      Container(
        width: 300,
        height: 300,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: colors.tertiaryFixed.withValues(alpha: 0.4),
          ),
        ),
      ),
      Container(
        width: 220,
        height: 220,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: colors.primaryFixedDim.withValues(alpha: 0.3),
          ),
        ),
      ),
    ],
  );
}
