import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';

class BookingCardActions extends StatelessWidget {
  const BookingCardActions({super.key, required this.actions});
  final List<({String label, VoidCallback onPressed})> actions;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final action in actions) ...[
        const SizedBox(height: DorakDimensions.spacingSmall),
        TextButton(
          style: TextButton.styleFrom(
            foregroundColor: DorakColors.of(context).primary,
            padding: EdgeInsets.zero,
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          onPressed: action.onPressed,
          child: Text(action.label),
        ),
      ],
    ],
  );
}
