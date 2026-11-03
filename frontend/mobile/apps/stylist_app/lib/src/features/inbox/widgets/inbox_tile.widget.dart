import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';

class InboxTile extends StatelessWidget {
  const InboxTile({
    super.key,
    required this.notification,
    required this.unreadLabel,
    required this.onTap,
  });

  final NotificationDto notification;
  final String unreadLabel;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = DorakColors.of(context);
    final unread = notification.isUnread;
    return Semantics(
      button: true,
      label: unread ? unreadLabel : null,
      child: Material(
        color: unread ? colors.surfaceContainer : colors.surfaceContainerLow,
        borderRadius: DorakDimensions.radiusMd,
        child: InkWell(
          customBorder: const RoundedRectangleBorder(
            borderRadius: DorakDimensions.radiusMd,
          ),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(DorakDimensions.spacingMedium),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox.square(
                  dimension: DorakDimensions.spacingSmall,
                  child: unread
                      ? DecoratedBox(
                          key: const ValueKey('inbox-unread-dot'),
                          decoration: BoxDecoration(
                            color: colors.primary,
                            shape: BoxShape.circle,
                          ),
                        )
                      : null,
                ),
                const SizedBox(width: DorakDimensions.spacingSmall),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        notification.title,
                        style: DorakTypography.labelLg.copyWith(
                          color: colors.onSurface,
                        ),
                      ),
                      Text(
                        notification.body,
                        style: DorakTypography.bodyMd.copyWith(
                          color: colors.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
