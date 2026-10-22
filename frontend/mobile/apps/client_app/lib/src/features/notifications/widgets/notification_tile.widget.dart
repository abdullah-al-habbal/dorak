import 'package:flutter/material.dart';
import 'package:core/core.dart';

import 'package:design_system/design_system.dart';

class NotificationTile extends StatelessWidget {
  const NotificationTile({
    super.key,
    required this.notification,
    required this.unreadLabel,
    required this.isMarking,
    required this.onTap,
  });

  final NotificationDto notification;
  final String unreadLabel;
  final bool isMarking;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = DorakColors.of(context);
    final unread = notification.isUnread;
    return Semantics(
      button: unread,
      label: unread ? unreadLabel : null,
      child: Material(
        color: unread ? colors.surfaceContainer : colors.surfaceContainerLow,
        borderRadius: DorakDimensions.radiusMd,
        child: InkWell(
          customBorder: const RoundedRectangleBorder(
            borderRadius: DorakDimensions.radiusMd,
          ),
          onTap: unread && !isMarking ? onTap : null,
          child: Padding(
            padding: const EdgeInsets.all(DorakDimensions.spacingMedium),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(
                    top: DorakDimensions.spacingSmall / 2,
                  ),
                  child: SizedBox.square(
                    dimension: DorakDimensions.spacingSmall,
                    child: unread
                        ? DecoratedBox(
                            key: const ValueKey('notification-unread-dot'),
                            decoration: BoxDecoration(
                              color: colors.primary,
                              shape: BoxShape.circle,
                            ),
                          )
                        : null,
                  ),
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
                      const SizedBox(height: DorakDimensions.spacingSmall / 2),
                      Text(
                        notification.body,
                        style: DorakTypography.bodyMd.copyWith(
                          color: colors.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                if (isMarking) const AppLoader.inline(),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
