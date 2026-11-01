import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/core/formatting/locale_formatters.entity.dart';

class StylistServicePrice extends StatelessWidget {
  const StylistServicePrice({
    super.key,
    required this.service,
    required this.currencyCode,
    required this.colors,
    required this.l10n,
    required this.localeCode,
  });

  final BarberServiceDto service;
  final String currencyCode;
  final DorakColors colors;
  final AppLocalizations l10n;
  final String localeCode;

  @override
  Widget build(BuildContext context) {
    final basePriceText = l10n.servicePrice(
      LocaleFormatters.decimal(
        MinorUnits.toMajor(service.priceAmountMinor),
        localeCode,
      ),
      currencyCode,
    );
    final displayPrice = service.displayPrice;
    if (displayPrice == null) {
      return Text(
        basePriceText,
        style: DorakTypography.labelLg.copyWith(color: colors.primary),
      );
    }

    final convertedPriceText = l10n.servicePrice(
      LocaleFormatters.decimal(
        MinorUnits.toMajor(displayPrice.amountMinor),
        localeCode,
      ),
      displayPrice.currencyCode,
    );
    if (!service.isDualPriceDisplayEnabled) {
      return Text(
        convertedPriceText,
        style: DorakTypography.labelLg.copyWith(color: colors.primary),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          convertedPriceText,
          style: DorakTypography.labelLg.copyWith(color: colors.primary),
        ),
        Text(
          basePriceText,
          style: DorakTypography.labelMd.copyWith(
            color: colors.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}
