import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/onboarding/widgets/glass_card.widget.dart';

class BookingDateCard extends StatelessWidget {
  const BookingDateCard({super.key, required this.colors, required this.l10n});
  final DorakColors colors;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) => Transform.rotate(
    angle: .035,
    child: GlassCard(
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: colors.primaryContainer,
            ),
            child: Icon(
              Icons.calendar_today,
              color: colors.onPrimaryContainer,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.bookingDateLabel,
                  style: DorakTypography.labelLg.copyWith(
                    color: colors.onSurface,
                  ),
                ),
                Text(
                  l10n.bookingTimeLabel,
                  style: DorakTypography.bodyMd.copyWith(
                    color: colors.secondary,
                  ),
                ),
              ],
            ),
          ),
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: colors.primary,
            ),
            child: Icon(Icons.check, color: colors.onPrimary, size: 18),
          ),
        ],
      ),
    ),
  );
}
