import 'package:business_app/src/features/operations/booking_status_menu.widget.dart';
import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class AppointmentCard extends StatelessWidget {
  const AppointmentCard({
    super.key,
    required this.booking,
    required this.l10n,
    required this.onStatusChanged,
  });

  final BookingDto booking;
  final AppLocalizations l10n;
  final void Function(BookingStatus status) onStatusChanged;

  String get _statusLabel => switch (booking.status) {
    BookingStatus.pending => l10n.bookingStatusPending,
    BookingStatus.confirmed => l10n.bookingStatusConfirmed,
    BookingStatus.inProgress => l10n.bookingStatusInProgress,
    BookingStatus.completed => l10n.bookingStatusCompleted,
    BookingStatus.cancelled => l10n.bookingStatusCancelled,
    BookingStatus.noShow => l10n.bookingStatusNoShow,
  };

  @override
  Widget build(BuildContext context) {
    final materialL10n = MaterialLocalizations.of(context);
    final startsAt = booking.startsAt.toLocal();
    return Card(
      child: ListTile(
        title: Text(
          l10n.businessAppointmentDateTime(
            materialL10n.formatMediumDate(startsAt),
            materialL10n.formatTimeOfDay(TimeOfDay.fromDateTime(startsAt)),
          ),
        ),
        subtitle: Text(
          '${booking.barber?.name ?? booking.chair?.label ?? l10n.businessUnassigned} · $_statusLabel',
        ),
        trailing: BookingStatusMenu(
          currentStatus: booking.status,
          onSelected: onStatusChanged,
        ),
      ),
    );
  }
}
