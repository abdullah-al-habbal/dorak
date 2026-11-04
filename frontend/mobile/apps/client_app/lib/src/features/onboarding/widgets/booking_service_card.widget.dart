import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/onboarding/widgets/glass_card.widget.dart';

class BookingServiceCard extends StatelessWidget {
  const BookingServiceCard({
    super.key,
    required this.colors,
    required this.l10n,
  });
  final DorakColors colors;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) => Transform.rotate(
    angle: -.035,
    child: GlassCard(
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: colors.surfaceContainerHigh,
              borderRadius: DorakDimensions.radiusDefault,
            ),
            child: Icon(Icons.content_cut, color: colors.primary, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.bookingServiceLabel,
                  style: DorakTypography.labelLg.copyWith(
                    color: colors.onSurface,
                  ),
                ),
                Text(
                  l10n.bookingServiceMeta,
                  style: DorakTypography.bodyMd.copyWith(
                    color: colors.secondary,
                  ),
                ),
              ],
            ),
          ),
          Icon(Icons.check_circle, color: colors.primary, size: 22),
        ],
      ),
    ),
  );
}
