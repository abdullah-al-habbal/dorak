import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/reviews/business_reviews.state.dart';

class BusinessReviewsBloc extends Cubit<BusinessReviewsState> {
  BusinessReviewsBloc(this._repository, this._disputes)
    : super(BusinessReviewsState());

  final BranchManagementRepository _repository;
  final ReviewDisputeRepository _disputes;

  Future<void> load() async {
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final page = await _repository.getReviews();
      if (isClosed) return;
      emit(state.copyWith(loading: false, reviews: page.data));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  /// Disputes a published review of this branch. Returns whether the backend
  /// accepted it; the review then shows as disputed in the list.
  Future<bool> dispute(String reviewId, String reason) async {
    final trimmed = reason.trim();
    if (trimmed.length < ReviewDisputeLimits.minReasonLength ||
        trimmed.length > ReviewDisputeLimits.maxReasonLength ||
        state.disputingId != null) {
      return false;
    }
    emit(state.copyWith(disputingId: reviewId, clearError: true));
    try {
      final updated = await _disputes.flagDispute(reviewId, reason: trimmed);
      if (isClosed) return false;
      emit(
        state.copyWith(
          reviews: [
            for (final review in state.reviews)
              if (review.id == reviewId) updated else review,
          ],
          clearDisputing: true,
        ),
      );
      return true;
    } catch (error) {
      if (isClosed) return false;
      emit(state.copyWith(clearDisputing: true, error: error));
      return false;
    }
  }
}
