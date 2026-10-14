import 'package:business_app/src/features/operations/booking_status_transitions.entity.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class BookingStatusMenu extends StatelessWidget {
  const BookingStatusMenu({
    super.key,
    required this.currentStatus,
    required this.onSelected,
  });

  final String currentStatus;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return PopupMenuButton<String>(
      onSelected: onSelected,
      itemBuilder: (_) => BookingStatusTransitions.from(currentStatus)
          .map(
            (status) => PopupMenuItem(
              value: status,
              child: Text(switch (status) {
                'confirmed' => l10n.businessConfirm,
                'in_progress' => l10n.businessStart,
                'completed' => l10n.businessComplete,
                'no_show' => l10n.businessNoShow,
                'canceled' => l10n.businessCancelBooking,
                _ => l10n.bookingStatusUnknown,
              }),
            ),
          )
          .toList(),
    );
  }
}
