import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/core/formatting/rating_label.entity.dart';

class StylistHeader extends StatelessWidget {
  const StylistHeader({
    super.key,
    required this.profile,
    required this.colors,
    required this.l10n,
  });

  final BarberProfileDto profile;
  final DorakColors colors;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        CircleAvatar(
          radius: 40,
          backgroundColor: colors.surfaceContainerHigh,
          child: Text(
            profile.name.characters.firstOrNull ?? '?',
            style: DorakTypography.headlineLgMobile.copyWith(
              color: colors.onSurface,
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                profile.name,
                style: DorakTypography.headlineLgMobile.copyWith(
                  color: colors.onSurface,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                RatingLabel.of(
                  l10n,
                  average: profile.ratingAvg,
                  count: profile.ratingCount,
                  localeCode: l10n.localeName,
                ),
                style: DorakTypography.bodyMd.copyWith(color: colors.primary),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  if (profile.rank != null) ...[
                    Text(
                      l10n.discoverRankBadge(profile.rank!),
                      style: DorakTypography.bodyMd.copyWith(
                        color: colors.primary,
                      ),
                    ),
                    const SizedBox(width: 12),
                  ],
                  if (profile.compatibilityScore != null)
                    Text(
                      l10n
                          .discoverCompatibilityBadge(
                            (profile.compatibilityScore! * 100).round(),
                          )
                          .toString(),
                      style: DorakTypography.bodyMd.copyWith(
                        color: colors.primary,
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
