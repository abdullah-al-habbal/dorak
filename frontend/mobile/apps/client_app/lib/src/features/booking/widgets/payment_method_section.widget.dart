import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class PaymentMethodSection extends StatelessWidget {
  const PaymentMethodSection({super.key, required this.l10n});
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(l10n.bookingPaymentTitle, style: DorakTypography.titleLg),
      const SizedBox(height: DorakDimensions.spacingSmall),
      Text(l10n.bookingPayAtSalon, style: DorakTypography.bodyLg),
      const SizedBox(height: DorakDimensions.spacingSmall),
      Text(l10n.bookingPayAtSalonOnly, style: DorakTypography.bodyMd),
    ],
  );
}
