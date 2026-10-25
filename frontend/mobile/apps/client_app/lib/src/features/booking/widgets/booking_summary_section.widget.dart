import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/core/formatting/locale_formatters.entity.dart';
import 'package:client_app/src/features/booking/widgets/booking_detail_line.widget.dart';
import 'package:client_app/src/features/booking/widgets/booking_details_section.widget.dart';

class BookingSummarySection extends StatelessWidget {
  const BookingSummarySection({
    super.key,
    required this.booking,
    required this.l10n,
    required this.localeCode,
    required this.statusLabel,
  });
  final BookingDto booking;
  final AppLocalizations l10n;
  final String localeCode;
  final String Function(AppLocalizations, BookingStatus) statusLabel;

  @override
  Widget build(BuildContext context) => BookingDetailsSection(
    title: l10n.bookingSummaryTitle,
    children: [
      BookingDetailLine(
        value: LocaleFormatters.dateTime(
          booking.timeSlot.toLocal(),
          localeCode,
        ),
      ),
      if (booking.endsAt != null)
        BookingDetailLine(
          value: l10n.bookingEndTimeLabel(
            LocaleFormatters.time(booking.endsAt!.toLocal(), localeCode),
          ),
        ),
      BookingDetailLine(value: statusLabel(l10n, booking.status)),
      if (booking.barber != null)
        BookingDetailLine(value: l10n.bookingWithBarber(booking.barber!.name)),
      if (booking.chair?.label != null)
        BookingDetailLine(value: l10n.bookingChairLabel(booking.chair!.label!)),
    ],
  );
}
