import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/booking/widgets/booking_detail_line.widget.dart';
import 'package:client_app/src/features/booking/widgets/booking_details_section.widget.dart';

class BookingLocationSection extends StatelessWidget {
  const BookingLocationSection({
    super.key,
    required this.booking,
    required this.l10n,
    required this.atHomeLocation,
  });
  final BookingDto booking;
  final AppLocalizations l10n;
  final AtHomeLocationDto? atHomeLocation;

  @override
  Widget build(BuildContext context) {
    final location = atHomeLocation;
    return BookingDetailsSection(
      title: location == null
          ? l10n.bookingChairLabel(booking.chair?.label ?? '')
          : l10n.bookingAtHomeToggle,
      children: location == null
          ? []
          : [
              BookingDetailLine(
                value: '${l10n.bookingAtHomeStreetLabel}: ${location.street}',
              ),
              BookingDetailLine(
                value:
                    '${l10n.bookingAtHomeBuildingLabel}: ${location.building}',
              ),
              BookingDetailLine(
                value: '${l10n.bookingAtHomeUnitLabel}: ${location.unit}',
              ),
              BookingDetailLine(
                value: '${location.latitude}, ${location.longitude}',
              ),
            ],
    );
  }
}
