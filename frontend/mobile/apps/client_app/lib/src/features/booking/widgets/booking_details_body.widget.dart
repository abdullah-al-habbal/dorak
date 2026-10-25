import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/booking/widgets/booking_location_section.widget.dart';
import 'package:client_app/src/features/booking/widgets/booking_services_section.widget.dart';
import 'package:client_app/src/features/booking/widgets/booking_summary_section.widget.dart';

class BookingDetailsBody extends StatelessWidget {
  const BookingDetailsBody({
    super.key,
    required this.booking,
    required this.serviceLine,
    required this.statusLabel,
  });

  final BookingDto booking;
  final String Function(BookingServiceDto service, String localeCode)
  serviceLine;
  final String Function(AppLocalizations l10n, BookingStatus status)
  statusLabel;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final localeCode = Localizations.localeOf(context).languageCode;
    final atHomeLocation = booking.atHomeLocation;
    return ListView(
      padding: const EdgeInsets.all(DorakDimensions.marginMobile),
      children: [
        BookingSummarySection(
          booking: booking,
          l10n: l10n,
          localeCode: localeCode,
          statusLabel: statusLabel,
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        BookingServicesSection(
          booking: booking,
          l10n: l10n,
          localeCode: localeCode,
          serviceLine: serviceLine,
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        BookingLocationSection(
          booking: booking,
          l10n: l10n,
          atHomeLocation: atHomeLocation,
        ),
      ],
    );
  }
}
