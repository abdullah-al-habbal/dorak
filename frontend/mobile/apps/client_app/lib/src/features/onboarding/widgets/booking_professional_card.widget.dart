import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/onboarding/widgets/glass_card.widget.dart';

class BookingProfessionalCard extends StatelessWidget {
  const BookingProfessionalCard({
    super.key,
    required this.colors,
    required this.l10n,
  });
  final DorakColors colors;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) => GlassCard(
    child: Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: colors.surface,
            border: Border.all(color: colors.primaryFixed, width: 2),
          ),
          child: Icon(Icons.person, color: colors.primary, size: 22),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.bookingProfessionalLabel,
              style: DorakTypography.labelLg.copyWith(color: colors.onSurface),
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.star, size: 14, color: colors.primary),
                const SizedBox(width: 4),
                Text(
                  l10n.bookingProfessionalRating,
                  style: DorakTypography.labelMd.copyWith(
                    color: colors.primary,
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    ),
  );
}
