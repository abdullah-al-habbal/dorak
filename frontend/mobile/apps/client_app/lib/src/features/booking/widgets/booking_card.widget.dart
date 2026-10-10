import 'package:flutter/material.dart';
import 'package:core/core.dart';

import 'package:design_system/design_system.dart';

import 'package:client_app/src/core/formatting/locale_formatters.entity.dart';

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
          _BookingCardHeader(
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
            _BookingCardCancelAction(
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
          _BookingCardActions(
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

class _BookingCardHeader extends StatelessWidget {
  const _BookingCardHeader({
    required this.booking,
    required this.localeCode,
    required this.statusLabel,
  });
  final BookingDto booking;
  final String localeCode;
  final String statusLabel;
  @override
  Widget build(BuildContext context) {
    final colors = DorakColors.of(context);
    return Row(
      children: [
        Expanded(
          child: Text(
            LocaleFormatters.dateTime(booking.timeSlot.toLocal(), localeCode),
            style: DorakTypography.titleLg,
          ),
        ),
        Text(
          statusLabel,
          style: DorakTypography.labelLg.copyWith(color: colors.primary),
        ),
      ],
    );
  }
}

class _BookingCardCancelAction extends StatelessWidget {
  const _BookingCardCancelAction({
    required this.onCancel,
    required this.isCancelling,
    required this.label,
  });
  final VoidCallback onCancel;
  final bool isCancelling;
  final String label;
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      const SizedBox(height: DorakDimensions.spacingSmall),
      if (isCancelling)
        const AppLoader.inline()
      else
        TextButton(
          style: TextButton.styleFrom(
            foregroundColor: DorakColors.of(context).error,
            padding: EdgeInsets.zero,
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          onPressed: onCancel,
          child: Text(label),
        ),
    ],
  );
}

class _BookingCardActions extends StatelessWidget {
  const _BookingCardActions({required this.actions});
  final List<({String label, VoidCallback onPressed})> actions;
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final action in actions) ...[
        const SizedBox(height: DorakDimensions.spacingSmall),
        TextButton(
          style: TextButton.styleFrom(
            foregroundColor: DorakColors.of(context).primary,
            padding: EdgeInsets.zero,
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          onPressed: action.onPressed,
          child: Text(action.label),
        ),
      ],
    ],
  );
}
