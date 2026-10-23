import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';

class BranchStorefront extends StatelessWidget {
  const BranchStorefront({super.key, required this.detail});

  final BranchDetailDto detail;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    final description = detail.description;
    final address = detail.address;
    final hoursLine = _hoursLine(l10n, detail.todayHours);
    final secondary = DorakTypography.bodyMd.copyWith(
      color: colors.onSurfaceVariant,
    );
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (description != null && description.isNotEmpty) ...[
          const SizedBox(height: DorakDimensions.spacingSmall),
          Text(
            description,
            style: DorakTypography.bodyLg.copyWith(color: colors.onSurface),
          ),
        ],
        if (address != null && address.isNotEmpty) ...[
          const SizedBox(height: DorakDimensions.spacingSmall),
          Row(
            children: [
              Icon(
                Icons.place_outlined,
                size: 18,
                color: colors.onSurfaceVariant,
                semanticLabel: l10n.branchAddressLabel,
              ),
              const SizedBox(width: DorakDimensions.spacingSmall),
              Expanded(child: Text(address, style: secondary)),
            ],
          ),
        ],
        if (hoursLine != null) ...[
          const SizedBox(height: DorakDimensions.spacingSmall),
          Row(
            children: [
              Icon(
                Icons.schedule_outlined,
                size: 18,
                color: colors.onSurfaceVariant,
              ),
              const SizedBox(width: DorakDimensions.spacingSmall),
              Expanded(child: Text(hoursLine, style: secondary)),
            ],
          ),
        ],
      ],
    );
  }

  String? _hoursLine(AppLocalizations l10n, BranchHoursDto? today) {
    if (today == null) return null;
    if (today.isClosed) return l10n.branchClosedToday;
    final opens = today.opensAt;
    final closes = today.closesAt;
    if (opens == null || closes == null) return null;
    return l10n.branchTodayHours(opens, closes);
  }
}
