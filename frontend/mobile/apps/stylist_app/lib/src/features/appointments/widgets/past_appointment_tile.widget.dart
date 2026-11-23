import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class PastAppointmentTile extends StatelessWidget {
  const PastAppointmentTile({super.key, required this.booking});

  final BookingDto booking;

  String _status(AppLocalizations l10n) => switch (booking.status) {
    BookingStatus.pending => l10n.bookingStatusPending,
    BookingStatus.confirmed => l10n.bookingStatusConfirmed,
    BookingStatus.inProgress => l10n.bookingStatusInProgress,
    BookingStatus.completed => l10n.bookingStatusCompleted,
    BookingStatus.cancelled => l10n.bookingStatusCancelled,
    BookingStatus.noShow => l10n.bookingStatusNoShow,
    BookingStatus.unknown => l10n.bookingStatusUnknown,
  };

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final material = MaterialLocalizations.of(context);
    final startsAt = booking.startsAt.toLocal();
    final services = booking.services.map((service) => service.name).join(', ');
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(DorakDimensions.spacingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.stylistAppointmentDateTime(
                material.formatMediumDate(startsAt),
                material.formatTimeOfDay(TimeOfDay.fromDateTime(startsAt)),
              ),
              style: DorakTypography.labelLg,
            ),
            Text(
              [_status(l10n), if (services.isNotEmpty) services].join(' · '),
            ),
          ],
        ),
      ),
    );
  }
}
