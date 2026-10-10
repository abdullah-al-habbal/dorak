import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';

import 'package:client_app/src/features/review/review_submit.bloc.dart';
import 'package:client_app/src/features/review/review_submit.event.dart';
import 'package:client_app/src/features/review/review_submit.state.dart';
import 'package:client_app/src/features/review/widgets/star_row.widget.dart';

class ReviewSubmitForm extends StatelessWidget {
  const ReviewSubmitForm({
    super.key,
    required this.bloc,
    required this.state,
    required this.selectedRating,
    required this.commentController,
    required this.onRatingChanged,
    required this.onSubmit,
  });

  final ReviewSubmitBloc bloc;
  final ReviewSubmitState state;
  final int selectedRating;
  final TextEditingController commentController;
  final ValueChanged<int> onRatingChanged;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    return ListView(
      padding: const EdgeInsets.all(DorakDimensions.marginMobile),
      children: [
        Text(
          l10n.reviewStylistPrompt,
          style: DorakTypography.headlineMd.copyWith(color: colors.onSurface),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: DorakDimensions.spacingLarge),
        StarRow(rating: selectedRating, onRated: onRatingChanged),
        const SizedBox(height: DorakDimensions.spacingLarge),
        Container(
          decoration: BoxDecoration(
            color: colors.inputBgSoft,
            borderRadius: DorakDimensions.radiusMd,
          ),
          child: TextField(
            controller: commentController,
            maxLines: 4,
            maxLength: 1000,
            style: DorakTypography.bodyMd,
            textAlignVertical: TextAlignVertical.top,
          ),
        ),
        const SizedBox(height: DorakDimensions.spacingLarge),
        if (state.error != null) ...[
          StatusBanner(
            message: _errorMessage(context, state.error!),
            actionLabel: l10n.actionRetry,
            onAction: () => bloc.add(const ReviewSubmitRetried()),
          ),
          const SizedBox(height: DorakDimensions.spacingMedium),
        ],
        PrimaryButton(
          label: l10n.reviewSubmitButton,
          isLoading: state.isSubmitting,
          isDisabled: selectedRating == 0,
          onPressed: onSubmit,
        ),
      ],
    );
  }

  String _errorMessage(BuildContext context, Object error) {
    final l10n = AppLocalizations.of(context)!;
    if (error is NetworkException) return l10n.errorNetwork;
    if (error is ApiException && error.statusCode == 409) {
      return l10n.reviewAlreadyReviewed;
    }
    if (error is ApiException && error.statusCode == 422) {
      return l10n.reviewBookingNotCompleted;
    }
    return l10n.reviewErrorGeneric;
  }
}
