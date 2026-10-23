import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class ChairServices extends StatelessWidget {
  const ChairServices({super.key, required this.chair, required this.plan});

  final FloorChairDto chair;
  final FloorPlanDto plan;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    final barber = chair.barber;
    final services = barber?.services ?? plan.branchServices;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          barber == null
              ? l10n.branchChairShopMenu
              : l10n.branchChairBarberServices(barber.name),
          style: DorakTypography.titleLg,
        ),
        const SizedBox(height: DorakDimensions.spacingSmall),
        if (services.isEmpty)
          Text(
            l10n.branchChairNoServices,
            style: DorakTypography.bodyMd.copyWith(
              color: colors.onSurfaceVariant,
            ),
          )
        else
          ...services.map(
            (service) => Padding(
              padding: const EdgeInsets.only(
                bottom: DorakDimensions.spacingSmall / 2,
              ),
              child: Text(service.name, style: DorakTypography.bodyMd),
            ),
          ),
      ],
    );
  }
}
