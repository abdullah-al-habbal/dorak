import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';
import 'package:design_system/design_system.dart';
import 'package:client_app/src/features/booking/branch_detail.state.dart';

class BookingSummary extends StatelessWidget {
  const BookingSummary({super.key, required this.state});
  final BranchDetailState state;
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final selected = state.detail!.services
        .where((service) => state.selectedServiceIds.contains(service.id))
        .toList(growable: false);
    final price = selected.fold<int>(
      0,
      (total, service) => total + (service.priceAmountMinor ?? 0),
    );
    final duration = selected.fold<int>(
      0,
      (total, service) => total + (service.durationMinutes ?? 0),
    );
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(DorakDimensions.spacingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l10n.bookingSummaryTitle, style: DorakTypography.titleLg),
            const SizedBox(height: DorakDimensions.spacingSmall),
            ...selected.map(
              (service) => Text(
                '${service.name} · ${service.priceAmountMinor == null ? '—' : MinorUnits.toMajor(service.priceAmountMinor!).toStringAsFixed(2)}',
                style: DorakTypography.bodyMd,
              ),
            ),
            const SizedBox(height: DorakDimensions.spacingSmall),
            Text(
              l10n.bookingTotalPrice(
                MinorUnits.toMajor(price).toStringAsFixed(2),
              ),
            ),
            Text(l10n.bookingTotalDuration(duration)),
          ],
        ),
      ),
    );
  }
}
