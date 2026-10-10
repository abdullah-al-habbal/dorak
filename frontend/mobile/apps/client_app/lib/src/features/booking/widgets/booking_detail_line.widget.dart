import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';

class BookingDetailLine extends StatelessWidget {
  const BookingDetailLine({super.key, required this.value});

  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: DorakDimensions.spacingSmall / 2),
      child: Text(value, style: DorakTypography.bodyMd),
    );
  }
}
