import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';

class CuratedCard extends StatelessWidget {
  const CuratedCard({super.key, required this.item});

  final CatalogItemDto item;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    final localeCode = Localizations.localeOf(context).languageCode;
    final name = LocalizedName.resolve(item.name, localeCode);
    final price = item.priceRange;
    final lines = <String>[
      if (price?.min != null && price?.max != null)
        l10n.curatedPriceRange(price!.min!, price.max!, price.currency ?? ''),
      if (item.stylePeriodType != null) item.stylePeriodType!.value,
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
          Text(name, style: DorakTypography.titleLg),
          if (lines.isNotEmpty) ...[
            const SizedBox(height: DorakDimensions.spacingSmall / 2),
            Text(
              lines.join('\n'),
              style: DorakTypography.bodyMd.copyWith(
                color: colors.onSurfaceVariant,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
