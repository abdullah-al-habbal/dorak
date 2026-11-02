import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/core/formatting/locale_formatters.entity.dart';
import 'package:client_app/src/features/booking/widgets/booking_detail_line.widget.dart';
import 'package:client_app/src/features/booking/widgets/booking_details_section.widget.dart';

class BookingServicesSection extends StatelessWidget {
  const BookingServicesSection({
    super.key,
    required this.booking,
    required this.l10n,
    required this.localeCode,
    required this.serviceLine,
  });
  final BookingDto booking;
  final AppLocalizations l10n;
  final String localeCode;
  final String Function(BookingServiceDto, String) serviceLine;

  @override
  Widget build(BuildContext context) {
    final totalPrice = booking.services.fold<int>(
      0,
      (total, service) => total + (service.priceAmountMinor ?? 0),
    );
    final totalDuration = booking.services.fold<int>(
      0,
      (total, service) => total + (service.durationMinutes ?? 0),
    );
    return BookingDetailsSection(
      title: l10n.bookingSelectServices,
      children: [
        for (final service in booking.services)
          BookingDetailLine(value: serviceLine(service, localeCode)),
        if (booking.services.isNotEmpty) ...[
          const Divider(),
          BookingDetailLine(
            value: l10n.bookingTotalPrice(
              LocaleFormatters.decimal(MinorUnits.toMajor(totalPrice), localeCode),
            ),
          ),
          BookingDetailLine(value: l10n.bookingTotalDuration(totalDuration)),
        ],
      ],
    );
  }
}
