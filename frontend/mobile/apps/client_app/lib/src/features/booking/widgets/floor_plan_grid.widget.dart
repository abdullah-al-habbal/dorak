import 'package:flutter/material.dart';
import 'package:core/core.dart';
import 'package:localization/localization.dart';

import 'package:design_system/design_system.dart';

import 'package:client_app/src/features/booking/widgets/floor_plan_legend_dot.widget.dart';
import 'package:client_app/src/features/booking/widgets/floor_plan_zone_grid.widget.dart';

class FloorPlanGrid extends StatefulWidget {
  const FloorPlanGrid({
    super.key,
    required this.chairs,
    this.zones = const [],
    required this.selectedChairId,
    required this.onChairSelected,
    required this.availableLabel,
    required this.occupiedLabel,
  });

  final List<FloorChairDto> chairs;
  final List<FloorPlanZoneDto> zones;
  final String? selectedChairId;
  final ValueChanged<String> onChairSelected;
  final String availableLabel;
  final String occupiedLabel;

  @override
  State<FloorPlanGrid> createState() => _FloorPlanGridState();
}

class _FloorPlanGridState extends State<FloorPlanGrid> {
  List<FloorChairDto>? _cachedChairs;
  List<FloorPlanZoneDto>? _cachedZones;
  Map<String, List<FloorChairDto>> _cachedByZone = const {};

  Map<String, List<FloorChairDto>> get _chairsByZone {
    if (identical(widget.chairs, _cachedChairs) &&
        identical(widget.zones, _cachedZones)) {
      return _cachedByZone;
    }
    _cachedChairs = widget.chairs;
    _cachedZones = widget.zones;
    final grouped = <String, List<FloorChairDto>>{};
    for (final zone in widget.zones) {
      grouped[zone.zone] = [];
    }
    for (final chair in widget.chairs) {
      final zone = chair.floorZone ?? 'shared';
      (grouped[zone] ??= []).add(chair);
    }
    const preferredOrder = ['men', 'women', 'shared'];
    final ordered = <String, List<FloorChairDto>>{};
    for (final zone in preferredOrder) {
      final chairs = grouped.remove(zone);
      if (chairs != null && chairs.isNotEmpty) ordered[zone] = chairs;
    }
    for (final entry in grouped.entries) {
      if (entry.value.isNotEmpty) ordered[entry.key] = entry.value;
    }
    _cachedByZone = Map.unmodifiable({
      for (final entry in ordered.entries)
        entry.key: List<FloorChairDto>.unmodifiable(entry.value),
    });
    return _cachedByZone;
  }

  @override
  Widget build(BuildContext context) {
    final colors = DorakColors.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            FloorPlanLegendDot(
              color: colors.primary,
              label: widget.availableLabel,
            ),
            const SizedBox(width: DorakDimensions.spacingMedium),
            FloorPlanLegendDot(
              color: colors.error,
              label: widget.occupiedLabel,
            ),
          ],
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        ..._chairsByZone.entries.map(
          (entry) => FloorPlanZoneGrid(
            zoneLabel: _zoneLabel(context, entry.key),
            chairs: entry.value,
            selectedChairId: widget.selectedChairId,
            onChairSelected: widget.onChairSelected,
          ),
        ),
      ],
    );
  }

  String _zoneLabel(BuildContext context, String zone) {
    final l10n = AppLocalizations.of(context)!;
    return switch (zone) {
      'men' => l10n.floorZoneMen,
      'women' => l10n.floorZoneWomen,
      _ => l10n.floorZoneShared,
    };
  }
}
