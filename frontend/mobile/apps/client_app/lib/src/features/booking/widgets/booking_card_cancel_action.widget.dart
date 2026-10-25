import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';

class BookingCardCancelAction extends StatelessWidget {
  const BookingCardCancelAction({
    super.key,
    required this.onCancel,
    required this.isCancelling,
    required this.label,
  });
  final VoidCallback onCancel;
  final bool isCancelling;
  final String label;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      const SizedBox(height: DorakDimensions.spacingSmall),
      if (isCancelling)
        const AppLoader.inline()
      else
        TextButton(
          style: TextButton.styleFrom(
            foregroundColor: DorakColors.of(context).error,
            padding: EdgeInsets.zero,
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          onPressed: onCancel,
          child: Text(label),
        ),
    ],
  );
}
