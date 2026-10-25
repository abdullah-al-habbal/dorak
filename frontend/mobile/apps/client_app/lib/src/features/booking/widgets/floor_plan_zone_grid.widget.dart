import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';

class FloorPlanZoneGrid extends StatelessWidget {
  const FloorPlanZoneGrid({
    super.key,
    required this.zoneLabel,
    required this.chairs,
    required this.selectedChairId,
    required this.onChairSelected,
  });

  final String zoneLabel;
  final List<FloorChairDto> chairs;
  final String? selectedChairId;
  final ValueChanged<String> onChairSelected;

  @override
  Widget build(BuildContext context) {
    final colors = DorakColors.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(zoneLabel, style: DorakTypography.titleLg),
        const SizedBox(height: DorakDimensions.spacingSmall),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
          ),
          itemCount: chairs.length,
          itemBuilder: (context, index) {
            final chair = chairs[index];
            final selectable =
                (chair.availability ?? chair.status) == ChairStatus.available;
            final selected = chair.id == selectedChairId;
            final background = selected
                ? colors.primary
                : !selectable
                ? colors.surfaceContainerHighest
                : colors.primaryContainer;
            final foreground = selected
                ? colors.onPrimary
                : !selectable
                ? colors.outline
                : colors.primary;
            return Padding(
              padding: const EdgeInsets.all(DorakDimensions.spacingSmall / 2),
              child: GestureDetector(
                onTap: selectable ? () => onChairSelected(chair.id) : null,
                child: Container(
                  decoration: BoxDecoration(
                    color: background,
                    borderRadius: DorakDimensions.radiusMd,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.content_cut, color: foreground),
                      const SizedBox(height: 4),
                      Text(
                        chair.label ?? chair.id,
                        style: DorakTypography.labelMd.copyWith(
                          color: foreground,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
        const SizedBox(height: DorakDimensions.spacingLarge),
      ],
    );
  }
}
