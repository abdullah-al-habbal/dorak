import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/stylist/widgets/stylist_service_price.widget.dart';

class StylistServiceCard extends StatelessWidget {
  const StylistServiceCard({
    super.key,
    required this.service,
    required this.currencyByCode,
    required this.colors,
    required this.l10n,
    required this.localeCode,
    required this.selected,
    required this.onToggled,
  });

  final BarberServiceDto service;
  final Map<String, CurrencyDto> currencyByCode;
  final DorakColors colors;
  final AppLocalizations l10n;
  final String localeCode;
  final bool selected;
  final VoidCallback onToggled;

  @override
  Widget build(BuildContext context) {
    final currencyCode = currencyByCode[service.currencyCode]?.code ?? '';
    return Container(
      margin: const EdgeInsets.only(bottom: DorakDimensions.spacingSmall),
      padding: const EdgeInsets.all(DorakDimensions.spacingSmall),
      decoration: BoxDecoration(
        border: Border.all(color: colors.outline),
        borderRadius: DorakDimensions.radiusMd,
      ),
      child: Row(
        children: [
          Checkbox(
            value: selected,
            onChanged: (_) => onToggled(),
            visualDensity: VisualDensity.compact,
            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(service.name, style: DorakTypography.labelLg),
                if (service.description != null &&
                    service.description!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    service.description!,
                    style: DorakTypography.bodyMd.copyWith(
                      color: colors.onSurfaceVariant,
                    ),
                  ),
                ],
                if (service.isAtHome) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(
                        Icons.home,
                        size: 16,
                        color: colors.onSurfaceVariant,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        l10n.serviceAtHomeLabel,
                        style: DorakTypography.labelMd.copyWith(
                          color: colors.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: DorakDimensions.spacingSmall),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              StylistServicePrice(
                service: service,
                currencyCode: currencyCode,
                colors: colors,
                l10n: l10n,
                localeCode: localeCode,
              ),
              if (service.duration != null) ...[
                const SizedBox(height: 4),
                Text(
                  l10n.serviceDurationLabel(service.duration!),
                  style: DorakTypography.labelMd.copyWith(
                    color: colors.onSurfaceVariant,
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
