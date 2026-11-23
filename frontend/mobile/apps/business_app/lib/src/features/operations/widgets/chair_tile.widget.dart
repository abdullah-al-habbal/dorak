import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class ChairTile extends StatelessWidget {
  const ChairTile({
    super.key,
    required this.chair,
    required this.l10n,
    required this.onStatusChanged,
  });

  final FloorChairDto chair;
  final AppLocalizations l10n;
  final void Function(ChairStatus status) onStatusChanged;

  String get _statusLabel => switch (chair.availability ?? chair.status) {
    ChairStatus.available => l10n.chairStatusAvailable,
    ChairStatus.occupied => l10n.chairStatusOccupied,
    ChairStatus.maintenance => l10n.chairStatusMaintenance,
    ChairStatus.unknown => l10n.chairStatusUnknown,
  };

  @override
  Widget build(BuildContext context) => ListTile(
    title: Text(chair.label ?? chair.id),
    subtitle: Text(
      '$_statusLabel · ${chair.barber?.name ?? l10n.businessUnassigned}',
    ),
    trailing: PopupMenuButton<ChairStatus>(
      onSelected: onStatusChanged,
      itemBuilder: (_) => [
        PopupMenuItem(
          value: ChairStatus.available,
          child: Text(l10n.chairStatusAvailable),
        ),
        PopupMenuItem(
          value: ChairStatus.occupied,
          child: Text(l10n.chairStatusOccupied),
        ),
        PopupMenuItem(
          value: ChairStatus.maintenance,
          child: Text(l10n.chairStatusMaintenance),
        ),
      ],
    ),
  );
}
