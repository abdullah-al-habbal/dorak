import 'package:flutter/material.dart';

import 'package:design_system/src/tokens/tokens.barrel.dart';

/// One tappable row of [AboutLinks].
class AboutLinkItem {
  const AboutLinkItem({
    required this.label,
    required this.onTap,
    this.icon = Icons.open_in_new,
  });

  final String label;
  final VoidCallback onTap;
  final IconData icon;
}

/// The About and Legal block shared by all apps: the legal links and the version.
/// Every string comes from the caller; the widget never resolves text.
class AboutLinks extends StatelessWidget {
  const AboutLinks({
    super.key,
    required this.title,
    required this.items,
    this.versionLabel,
  });

  final String title;
  final List<AboutLinkItem> items;

  /// For example `Version 1.4.2+17`; omitted when null or empty.
  final String? versionLabel;

  @override
  Widget build(BuildContext context) {
    final colors = DorakColors.of(context);
    final version = versionLabel;

    return Semantics(
      container: true,
      label: title,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(
              vertical: DorakDimensions.spacingSmall,
            ),
            child: Text(
              title,
              style: DorakTypography.titleLg.copyWith(color: colors.onSurface),
            ),
          ),
          for (final item in items)
            ListTile(
              contentPadding: EdgeInsets.zero,
              minVerticalPadding: DorakDimensions.spacingSmall,
              title: Text(
                item.label,
                style: DorakTypography.bodyLg.copyWith(color: colors.onSurface),
              ),
              trailing: Icon(
                item.icon,
                size: 20,
                color: colors.onSurfaceVariant,
                semanticLabel: '',
              ),
              onTap: item.onTap,
            ),
          if (version != null && version.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: DorakDimensions.spacingSmall),
              child: Text(
                version,
                style: DorakTypography.labelMd.copyWith(
                  color: colors.onSurfaceVariant,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
