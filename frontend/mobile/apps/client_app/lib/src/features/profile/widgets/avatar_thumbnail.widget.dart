import 'package:flutter/material.dart';

import 'package:design_system/design_system.dart';

class AvatarThumbnail extends StatelessWidget {
  const AvatarThumbnail({
    super.key,
    required this.avatarUrl,
    required this.initial,
  });

  final String? avatarUrl;
  final String initial;

  @override
  Widget build(BuildContext context) {
    final colors = DorakColors.of(context);
    final fallback = ColoredBox(
      color: colors.primaryContainer,
      child: Center(
        child: Text(
          initial,
          style: DorakTypography.titleLg.copyWith(
            color: colors.onPrimaryContainer,
          ),
        ),
      ),
    );
    return ClipOval(
      child: SizedBox(
        width: 56,
        height: 56,
        child: avatarUrl == null
            ? fallback
            : Image.network(
                avatarUrl!,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => fallback,
              ),
      ),
    );
  }
}
