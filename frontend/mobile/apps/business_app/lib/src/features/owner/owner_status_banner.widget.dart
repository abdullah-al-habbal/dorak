import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

/// The approval banner at the top of the owner home. Active brands show nothing.
class OwnerStatusBanner extends StatelessWidget {
  const OwnerStatusBanner({
    super.key,
    required this.status,
    this.reason,
    this.onResubmit,
    this.isResubmitting = false,
  });

  final OwnerBrandStatus status;
  final String? reason;

  /// Set only when the brand may still be resubmitted.
  final VoidCallback? onResubmit;
  final bool isResubmitting;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final message = switch (status) {
      OwnerBrandStatus.pending => l10n.ownerBannerPending,
      OwnerBrandStatus.rejected =>
        reason == null || reason!.isEmpty
            ? l10n.ownerBannerRejectedNoReason
            : l10n.ownerBannerRejected(reason!),
      OwnerBrandStatus.suspended => l10n.ownerBannerSuspended,
      _ => null,
    };
    if (message == null) return const SizedBox.shrink();
    final resubmit = onResubmit;
    return Semantics(
      container: true,
      liveRegion: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          StatusBanner(message: message),
          if (resubmit != null) ...[
            const SizedBox(height: DorakDimensions.spacingSmall),
            SecondaryButton(
              label: l10n.ownerResubmit,
              onPressed: isResubmitting ? () {} : resubmit,
            ),
          ],
        ],
      ),
    );
  }
}
