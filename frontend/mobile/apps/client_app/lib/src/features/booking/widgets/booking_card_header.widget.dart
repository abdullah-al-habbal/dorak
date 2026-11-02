import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';

import 'package:client_app/src/core/formatting/locale_formatters.entity.dart';

class BookingCardHeader extends StatelessWidget {
  const BookingCardHeader({
    super.key,
    required this.booking,
    required this.localeCode,
    required this.statusLabel,
  });
  final BookingDto booking;
  final String localeCode;
  final String statusLabel;

  @override
  Widget build(BuildContext context) {
    final colors = DorakColors.of(context);
    return Row(
      children: [
        Expanded(
          child: Text(
            LocaleFormatters.dateTime(booking.startsAt.toLocal(), localeCode),
            style: DorakTypography.titleLg,
          ),
        ),
        Text(
          statusLabel,
          style: DorakTypography.labelLg.copyWith(color: colors.primary),
        ),
      ],
    );
  }
}
