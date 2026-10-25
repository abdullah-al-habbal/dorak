import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class BookingActions extends StatelessWidget {
  const BookingActions({
    super.key,
    required this.booking,
    required this.isUpdating,
    required this.onAction,
    required this.l10n,
  });

  final BookingDto booking;
  final bool isUpdating;
  final ValueChanged<BarberBookingAction> onAction;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) {
    final action = switch (booking.status) {
      BookingStatus.pending => (
        BarberBookingAction.accept,
        l10n.stylistAcceptBooking,
      ),
      BookingStatus.confirmed => (
        BarberBookingAction.start,
        l10n.stylistStartSession,
      ),
      BookingStatus.inProgress => (
        BarberBookingAction.complete,
        l10n.stylistCompleteSession,
      ),
      _ => null,
    };
    if (action == null) return const SizedBox.shrink();
    return Wrap(
      spacing: 8,
      children: [
        FilledButton(
          onPressed: isUpdating ? null : () => onAction(action.$1),
          child: Text(action.$2),
        ),
        if (booking.status == BookingStatus.inProgress)
          OutlinedButton(
            onPressed: isUpdating
                ? null
                : () => onAction(BarberBookingAction.noShow),
            child: Text(l10n.stylistMarkNoShow),
          ),
      ],
    );
  }
}
