import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class StylistWorkplaces extends StatelessWidget {
  const StylistWorkplaces({super.key, required this.workplaces});

  final List<BarberWorkplaceDto> workplaces;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(l10n.stylistWorkplacesTitle, style: DorakTypography.titleLg),
        const SizedBox(height: DorakDimensions.spacingSmall),
        ...workplaces.map((workplace) {
          final place = workplace.name ?? '';
          final chair = workplace.chairLabel;
          return Padding(
            padding: const EdgeInsets.only(
              bottom: DorakDimensions.spacingSmall / 2,
            ),
            child: Row(
              children: [
                Icon(
                  workplace.isBranch ? Icons.storefront : Icons.business,
                  size: 18,
                  color: colors.primary,
                ),
                const SizedBox(width: DorakDimensions.spacingSmall),
                Expanded(
                  child: Text(
                    chair == null
                        ? place
                        : l10n.stylistWorkplaceChair(place, chair),
                    style: DorakTypography.bodyMd,
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }
}
