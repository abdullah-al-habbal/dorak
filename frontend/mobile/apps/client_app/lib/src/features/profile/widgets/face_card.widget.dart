import 'package:design_system/design_system.dart';
import 'package:feature_error_feedback/feature_error_feedback.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/profile/face_analysis.state.dart';
import 'package:client_app/src/features/profile/widgets/face_photo.widget.dart';

class FaceCard extends StatelessWidget {
  const FaceCard({
    super.key,
    required this.state,
    required this.onScan,
    required this.onCheckAgain,
  });

  final FaceAnalysisState state;
  final VoidCallback onScan;
  final VoidCallback onCheckAgain;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    final Widget content = switch (state.status) {
      FaceAnalysisStatus.initial ||
      FaceAnalysisStatus.loading ||
      FaceAnalysisStatus.uploading => const Padding(
        padding: EdgeInsets.symmetric(vertical: DorakDimensions.spacingLarge),
        child: Center(child: AppLoader.inline()),
      ),
      FaceAnalysisStatus.failed => _errorContent(context, l10n),
      FaceAnalysisStatus.ready ||
      FaceAnalysisStatus.degraded => _readyContent(context, l10n),
    };
    return Container(
      padding: const EdgeInsets.all(DorakDimensions.spacingMedium),
      decoration: BoxDecoration(
        color: colors.surfaceContainerLow,
        borderRadius: DorakDimensions.radiusMd,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(l10n.faceAnalysisTitle, style: DorakTypography.titleLg),
          const SizedBox(height: DorakDimensions.spacingMedium),
          content,
        ],
      ),
    );
  }

  Widget _errorContent(BuildContext context, AppLocalizations l10n) {
    final message = ErrorFeedback.loadMessage(l10n, state.error);
    return StatusView(
      icon: Icons.error_outline,
      title: l10n.errorTitleGeneric,
      message: message,
      actionLabel: l10n.actionRetry,
      onAction: state.analysisFailed ? onScan : onCheckAgain,
    );
  }

  Widget _readyContent(BuildContext context, AppLocalizations l10n) {
    final latest = state.latest;
    if (latest == null) {
      if (state.awaitingAnalysis) return _pendingContent(context, l10n);
      return _emptyContent(context, l10n);
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (state.status == FaceAnalysisStatus.degraded)
          Padding(
            padding: const EdgeInsets.only(
              bottom: DorakDimensions.spacingSmall,
            ),
            child: StatusBanner(
              message: ErrorFeedback.loadMessage(l10n, state.catalogError),
            ),
          ),
        Row(
          children: [
            _facePhoto(
              context,
              latest.faceProfile?.imageUrl,
              onExpired: onCheckAgain,
            ),
            const SizedBox(width: DorakDimensions.spacingMedium),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${l10n.faceAnalysisDetectedShape}: '
                    '${_shapeLabel(l10n, latest.detectedFaceShape)}',
                    style: DorakTypography.bodyMd,
                  ),
                  const SizedBox(height: DorakDimensions.spacingSmall / 2),
                  Text(
                    '${l10n.faceAnalysisConfidence}: '
                    '${(latest.confidenceRatio * 100).round()}%',
                    style: DorakTypography.bodyMd.copyWith(
                      color: DorakColors.of(context).onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        SecondaryButton(label: l10n.faceScanAction, onPressed: onScan),
      ],
    );
  }

  Widget _pendingContent(BuildContext context, AppLocalizations l10n) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (state.uploadedPhotoUrl != null) ...[
          _facePhoto(context, state.uploadedPhotoUrl, onExpired: onCheckAgain),
          const SizedBox(height: DorakDimensions.spacingMedium),
        ],
        Text(l10n.faceAnalysisPendingTitle, style: DorakTypography.titleLg),
        const SizedBox(height: DorakDimensions.spacingSmall / 2),
        Text(
          l10n.faceAnalysisPendingMessage,
          style: DorakTypography.bodyMd.copyWith(
            color: DorakColors.of(context).onSurfaceVariant,
          ),
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        SecondaryButton(label: l10n.actionCheckAgain, onPressed: onCheckAgain),
      ],
    );
  }

  Widget _emptyContent(BuildContext context, AppLocalizations l10n) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(l10n.faceAnalysisEmptyTitle, style: DorakTypography.titleLg),
        const SizedBox(height: DorakDimensions.spacingSmall / 2),
        Text(
          l10n.faceAnalysisEmptyMessage,
          style: DorakTypography.bodyMd.copyWith(
            color: DorakColors.of(context).onSurfaceVariant,
          ),
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        SecondaryButton(label: l10n.faceScanAction, onPressed: onScan),
      ],
    );
  }

  Widget _facePhoto(
    BuildContext context,
    String? url, {
    VoidCallback? onExpired,
  }) {
    final colors = DorakColors.of(context);
    final placeholder = Container(
      color: colors.surfaceContainerHighest,
      child: Icon(Icons.face_outlined, color: colors.onSurfaceVariant),
    );
    return FacePhoto(url: url, placeholder: placeholder, onExpired: onExpired);
  }

  String _shapeLabel(AppLocalizations l10n, String shape) {
    switch (shape) {
      case 'oval':
        return l10n.faceShapeOval;
      case 'round':
        return l10n.faceShapeRound;
      case 'square':
        return l10n.faceShapeSquare;
      case 'heart':
        return l10n.faceShapeHeart;
      case 'diamond':
        return l10n.faceShapeDiamond;
      case 'oblong':
        return l10n.faceShapeOblong;
      case 'triangle':
        return l10n.faceShapeTriangle;
    }
    return shape;
  }
}
