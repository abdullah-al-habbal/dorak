import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';

import 'package:client_app/src/core/formatting/locale_formatters.entity.dart';

class HistoryCard extends StatelessWidget {
  const HistoryCard({
    super.key,
    required this.item,
    required this.itemName,
    required this.localeCode,
    required this.rebookLabel,
    required this.isRebooking,
    required this.onRebook,
    required this.attachLabel,
    required this.isAttaching,
    required this.onAttachPhoto,
  });

  final ServiceHistoryDto item;
  final String itemName;
  final String localeCode;
  final String rebookLabel;
  final bool isRebooking;
  final VoidCallback onRebook;
  final String attachLabel;
  final bool isAttaching;
  final VoidCallback onAttachPhoto;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    final performedAt = item.performedAtOnBranchClock;
    final metaLines = [
      if (itemName.isNotEmpty) itemName,
      if (item.barber != null) l10n.bookingWithBarber(item.barber!.name),
      if (item.branch != null) item.branch!.name,
    ];
    return Container(
      padding: const EdgeInsets.all(DorakDimensions.spacingMedium),
      decoration: BoxDecoration(
        color: colors.surfaceContainerLow,
        borderRadius: DorakDimensions.radiusMd,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  performedAt == null
                      ? ''
                      : LocaleFormatters.dateTime(
                          performedAt,
                          localeCode,
                        ),
                  style: DorakTypography.titleLg,
                ),
              ),
              if (isRebooking)
                const AppLoader.inline()
              else
                TextButton(
                  style: TextButton.styleFrom(
                    foregroundColor: colors.primary,
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  onPressed: onRebook,
                  child: Text(rebookLabel),
                ),
            ],
          ),
          if (isAttaching)
            const AppLoader.inline()
          else
            TextButton(onPressed: onAttachPhoto, child: Text(attachLabel)),
          if (metaLines.isNotEmpty) ...[
            const SizedBox(height: DorakDimensions.spacingSmall / 2),
            Text(
              metaLines.join('\n'),
              style: DorakTypography.bodyMd.copyWith(
                color: colors.onSurfaceVariant,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
