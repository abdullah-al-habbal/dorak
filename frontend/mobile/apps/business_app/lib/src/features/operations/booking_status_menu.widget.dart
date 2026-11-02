import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/operations/booking_status_transitions.entity.dart';

class BookingStatusMenu extends StatelessWidget {
  const BookingStatusMenu({
    super.key,
    required this.currentStatus,
    required this.onSelected,
  });

  final BookingStatus currentStatus;
  final ValueChanged<BookingStatus> onSelected;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return PopupMenuButton<BookingStatus>(
      onSelected: onSelected,
      itemBuilder: (_) => BookingStatusTransitions.from(currentStatus)
          .map(
            (status) => PopupMenuItem(
              value: status,
              child: Text(switch (status) {
                BookingStatus.confirmed => l10n.businessConfirm,
                BookingStatus.inProgress => l10n.businessStart,
                BookingStatus.completed => l10n.businessComplete,
                BookingStatus.noShow => l10n.businessNoShow,
                BookingStatus.cancelled => l10n.businessCancelBooking,
                BookingStatus.pending => l10n.bookingStatusUnknown,
              }),
            ),
          )
          .toList(),
    );
  }
}
