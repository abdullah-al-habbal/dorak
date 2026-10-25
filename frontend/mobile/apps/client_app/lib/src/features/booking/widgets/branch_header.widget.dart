import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';

class BranchHeader extends StatelessWidget {
  const BranchHeader({
    super.key,
    required this.detail,
    required this.colors,
    required this.chairsLabel,
    required this.ratingLabel,
    required this.onFavorite,
  });
  final BranchDetailDto detail;
  final DorakColors colors;
  final String chairsLabel;
  final String ratingLabel;
  final void Function(String, String) onFavorite;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        detail.name,
        style: DorakTypography.headlineLgMobile.copyWith(
          color: colors.onSurface,
        ),
      ),
      Align(
        alignment: Alignment.centerRight,
        child: IconButton(
          icon: const Icon(Icons.favorite_border),
          onPressed: () => onFavorite(detail.id.toString(), 'branch'),
        ),
      ),
      const SizedBox(height: 4),
      Text(
        ratingLabel,
        style: DorakTypography.bodyMd.copyWith(color: colors.primary),
      ),
      const SizedBox(height: 4),
      Text(
        chairsLabel,
        style: DorakTypography.bodyMd.copyWith(color: colors.onSurfaceVariant),
      ),
    ],
  );
}
