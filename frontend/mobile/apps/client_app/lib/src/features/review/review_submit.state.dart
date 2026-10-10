import 'package:equatable/equatable.dart';
import 'package:core/core.dart';

class ReviewSubmitState extends Equatable {
  const ReviewSubmitState({
    this.bookingId,
    this.rating,
    this.comment,
    this.isSubmitting = false,
    this.submitted = false,
    this.review,
    this.error,
  });

  final String? bookingId;
  final int? rating;
  final String? comment;
  final bool isSubmitting;
  final bool submitted;
  final ReviewDto? review;
  final Object? error;

  ReviewSubmitState copyWith({
    String? bookingId,
    int? rating,
    String? comment,
    bool? isSubmitting,
    bool? submitted,
    ReviewDto? review,
    Object? error,
    bool clearError = false,
  }) {
    return ReviewSubmitState(
      bookingId: bookingId ?? this.bookingId,
      rating: rating ?? this.rating,
      comment: comment ?? this.comment,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      submitted: submitted ?? this.submitted,
      review: review ?? this.review,
      error: clearError ? null : error ?? this.error,
    );
  }

  @override
  List<Object?> get props => [
    bookingId,
    rating,
    comment,
    isSubmitting,
    submitted,
    review,
    error,
  ];
}
