import 'package:flutter/material.dart';
import 'package:core/core.dart';

import 'package:design_system/design_system.dart';

import 'package:client_app/src/features/booking/widgets/booking_card_actions.widget.dart';
import 'package:client_app/src/features/booking/widgets/booking_card_cancel_action.widget.dart';
import 'package:client_app/src/features/booking/widgets/booking_card_header.widget.dart';

class BookingCard extends StatelessWidget {
  const BookingCard({
    super.key,
    required this.booking,
    required this.localeCode,
    required this.statusLabel,
    required this.barberLine,
    required this.chairLine,
    this.endTimeLine,
    required this.cancelLabel,
    required this.isCancelling,
    this.onCancel,
    this.cancellationWarning,
    this.rateLabel,
    this.onRate,
    this.trackerLabel,
    this.onTrack,
    this.detailsLabel,
    this.onDetails,
  });

  final BookingDto booking;
  final String localeCode;
  final String statusLabel;
  final String? barberLine;
  final String? chairLine;
  final String? endTimeLine;
  final String cancelLabel;
  final bool isCancelling;
  final VoidCallback? onCancel;
  final String? cancellationWarning;
  final String? rateLabel;
  final VoidCallback? onRate;
  final String? trackerLabel;
  final VoidCallback? onTrack;
  final String? detailsLabel;
  final VoidCallback? onDetails;

  @override
  Widget build(BuildContext context) {
    final colors = DorakColors.of(context);
    final cancel = onCancel;
    final metaLines = [
      ?barberLine,
      ?chairLine,
      ?endTimeLine,
      if (booking.services.isNotEmpty)
        booking.services.map((service) => service.name).join(' · '),
    ];
    return Container(
      padding: const EdgeInsets.all(DorakDimensions.spacingMedium),
      decoration: BoxDecoration(
        color: colors.surfaceContainerLow,
        borderRadius: DorakDimensions.radiusMd,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          BookingCardHeader(
            booking: booking,
            localeCode: localeCode,
            statusLabel: statusLabel,
          ),
          if (metaLines.isNotEmpty) ...[
            const SizedBox(height: DorakDimensions.spacingSmall / 2),
            Text(
              metaLines.join('\n'),
              style: DorakTypography.bodyMd.copyWith(
                color: colors.onSurfaceVariant,
              ),
            ),
          ],
          if (cancel != null)
            BookingCardCancelAction(
              onCancel: cancel,
              isCancelling: isCancelling,
              label: cancelLabel,
            ),
          if (cancellationWarning != null) ...[
            const SizedBox(height: DorakDimensions.spacingSmall),
            Text(
              cancellationWarning!,
              style: DorakTypography.bodyMd.copyWith(color: colors.error),
            ),
          ],
          BookingCardActions(
            actions: [
              if (onRate != null) (label: rateLabel!, onPressed: onRate!),
              if (onTrack != null) (label: trackerLabel!, onPressed: onTrack!),
              if (onDetails != null)
                (label: detailsLabel!, onPressed: onDetails!),
            ],
          ),
        ],
      ),
    );
  }
}
