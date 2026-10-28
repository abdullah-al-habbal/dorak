import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class BusinessReviewsState extends Equatable {
  BusinessReviewsState({
    this.loading = false,
    List<ReviewDto> reviews = const [],
    this.error,
  }) : reviews = List.unmodifiable(reviews);

  final bool loading;
  final List<ReviewDto> reviews;
  final Object? error;

  BusinessReviewsState copyWith({
    bool? loading,
    List<ReviewDto>? reviews,
    Object? error,
    bool clearError = false,
  }) => BusinessReviewsState(
    loading: loading ?? this.loading,
    reviews: reviews ?? this.reviews,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [loading, reviews, error];
}
