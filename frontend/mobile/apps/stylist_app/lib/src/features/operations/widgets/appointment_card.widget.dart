import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/operations/widgets/booking_actions.widget.dart';

class AppointmentCard extends StatelessWidget {
  const AppointmentCard({
    super.key,
    required this.booking,
    required this.isUpdating,
    required this.onAction,
    required this.onCancel,
    required this.onViewHistory,
    required this.l10n,
  });

  final BookingDto booking;
  final bool isUpdating;
  final ValueChanged<BarberBookingAction> onAction;
  final VoidCallback onCancel;
  final VoidCallback onViewHistory;
  final AppLocalizations l10n;

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
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.stylistAppointmentDateTime(
                materialL10n.formatMediumDate(startsAt),
                materialL10n.formatTimeOfDay(TimeOfDay.fromDateTime(startsAt)),
              ),
            ),
            Text(
              '$_statusLabel · ${booking.services.map((service) => service.name).join(', ')}',
            ),
            const SizedBox(height: 8),
            BookingActions(
              booking: booking,
              isUpdating: isUpdating,
              onAction: onAction,
              onCancel: onCancel,
              l10n: l10n,
            ),
            if (booking.status == BookingStatus.completed &&
                booking.client != null)
              TextButton.icon(
                onPressed: onViewHistory,
                icon: const Icon(Icons.history),
                label: Text(l10n.stylistClientHistoryAction),
              ),
          ],
        ),
      ),
    );
  }
}
