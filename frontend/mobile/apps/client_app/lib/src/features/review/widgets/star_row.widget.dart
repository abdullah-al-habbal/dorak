import 'package:flutter/material.dart';

import 'package:design_system/design_system.dart';

class StarRow extends StatelessWidget {
  const StarRow({super.key, required this.rating, required this.onRated});

  final int rating;
  final ValueChanged<int> onRated;

  @override
  Widget build(BuildContext context) {
    final colors = DorakColors.of(context);
    return Row(
      spacing: 8,
      children: [
        for (var i = 1; i <= 5; i++)
          IconButton(
            iconSize: 40,
            icon: Icon(
              i <= rating ? Icons.star : Icons.star_border,
              color: i <= rating
                  ? colors.tertiaryContainer
                  : colors.outlineVariant,
            ),
            onPressed: () => onRated(i),
          ),
      ],
    );
  }
}
