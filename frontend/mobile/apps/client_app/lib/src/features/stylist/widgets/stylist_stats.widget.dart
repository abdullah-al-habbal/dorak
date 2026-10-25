import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/stylist/models/stylist_stat_item.entity.dart';

class StylistStats extends StatelessWidget {
  const StylistStats({
    super.key,
    required this.profile,
    required this.colors,
    required this.l10n,
  });

  final BarberProfileDto profile;
  final DorakColors colors;
  final AppLocalizations l10n;

  List<StylistStatItem> get _stats {
    final stats = <StylistStatItem>[
      StylistStatItem(
        value: '${profile.services.length}',
        label: l10n.stylistStatServicesLabel,
      ),
    ];
    if (profile.rank != null) {
      stats.add(
        StylistStatItem(
          value: l10n.discoverRankBadge(profile.rank!),
          label: l10n.stylistStatRankLabel,
        ),
      );
    }
    if (profile.compatibilityScore != null) {
      stats.add(
        StylistStatItem(
          value: l10n
              .discoverCompatibilityBadge(
                (profile.compatibilityScore! * 100).round(),
              )
              .toString(),
          label: l10n.stylistStatCompatibilityLabel,
        ),
      );
    }
    return stats;
  }

  @override
  Widget build(BuildContext context) {
    final stats = _stats;
    if (stats.isEmpty) return const SizedBox.shrink();
    return Row(
      children: [
        for (var i = 0; i < stats.length; i++) ...[
          if (i > 0) const SizedBox(width: DorakDimensions.spacingLarge),
          Expanded(
            child: Column(
              children: [
                Text(
                  stats[i].value,
                  style: DorakTypography.titleLg.copyWith(
                    color: colors.primary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  stats[i].label,
                  style: DorakTypography.bodyMd.copyWith(
                    color: colors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
