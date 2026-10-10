import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:client_app/src/features/review/review_submit.event.dart';
import 'package:client_app/src/features/review/review_submit.state.dart';

class ReviewSubmitBloc extends Bloc<ReviewSubmitEvent, ReviewSubmitState> {
  ReviewSubmitBloc(this._reviews) : super(const ReviewSubmitState()) {
    on<ReviewSubmitStarted>(_onStarted);
    on<ReviewSubmitRetried>(_onRetried);
  }

  final ReviewRepository _reviews;

  Future<void> _onStarted(
    ReviewSubmitStarted event,
    Emitter<ReviewSubmitState> emit,
  ) async {
    emit(
      ReviewSubmitState(
        bookingId: event.bookingId,
        rating: event.rating,
        comment: event.comment,
        isSubmitting: true,
      ),
    );
    try {
      final review = await _reviews.submitReview(
        event.bookingId,
        rating: event.rating,
        comment: event.comment,
      );
      if (emit.isDone) return;
      emit(
        state.copyWith(isSubmitting: false, submitted: true, review: review),
      );
    } catch (error) {
      if (emit.isDone) return;
      emit(state.copyWith(isSubmitting: false, error: error));
    }
  }

  Future<void> _onRetried(
    ReviewSubmitRetried event,
    Emitter<ReviewSubmitState> emit,
  ) async {
    final bookingId = state.bookingId;
    final rating = state.rating;
    if (bookingId == null || rating == null) return;
    await _onStarted(
      ReviewSubmitStarted(bookingId, rating: rating, comment: state.comment),
      emit,
    );
  }
}
