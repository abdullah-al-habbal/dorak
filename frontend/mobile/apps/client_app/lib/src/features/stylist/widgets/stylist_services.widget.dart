import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/stylist/widgets/stylist_service_card.widget.dart';

class StylistServices extends StatelessWidget {
  const StylistServices({
    super.key,
    required this.profile,
    required this.currencies,
    required this.colors,
    required this.l10n,
    required this.localeCode,
  });

  final BarberProfileDto profile;
  final List<CurrencyDto> currencies;
  final DorakColors colors;
  final AppLocalizations l10n;
  final String localeCode;

  @override
  Widget build(BuildContext context) {
    if (profile.services.isEmpty) {
      return Text(
        l10n.stylistNoServicesMessage,
        style: DorakTypography.bodyMd.copyWith(color: colors.onSurfaceVariant),
      );
    }
    final currencyById = <String, CurrencyDto>{
      for (final currency in currencies) currency.id: currency,
    };
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(l10n.stylistServicesTitle, style: DorakTypography.titleLg),
        const SizedBox(height: DorakDimensions.spacingSmall),
        ...profile.services.map(
          (service) => StylistServiceCard(
            service: service,
            currencyById: currencyById,
            colors: colors,
            l10n: l10n,
            localeCode: localeCode,
          ),
        ),
      ],
    );
  }
}
