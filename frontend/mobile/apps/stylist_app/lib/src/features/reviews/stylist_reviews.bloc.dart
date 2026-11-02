import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:stylist_app/src/features/reviews/stylist_reviews.state.dart';

class StylistReviewsBloc extends Cubit<StylistReviewsState> {
  StylistReviewsBloc(this._reviews, this._disputes, this._barberId)
    : super(StylistReviewsState());

  final ReviewRepository _reviews;
  final ReviewDisputeRepository _disputes;
  final String? Function() _barberId;

  /// Loads the stylist's published reviews, the only ones that can be disputed.
  Future<void> load() async {
    final barberId = _barberId();
    if (barberId == null) return;
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final page = await _reviews.getBarberReviews(barberId);
      if (isClosed) return;
      emit(state.copyWith(loading: false, reviews: page.data));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  /// Disputes a published review about this stylist. Returns whether the
  /// backend accepted it; the review is then held from public listings.
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
