import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class StylistReviewsState extends Equatable {
  StylistReviewsState({
    this.loading = false,
    this.disputingId,
    List<ReviewDto> reviews = const [],
    this.error,
  }) : reviews = List.unmodifiable(reviews);

  final bool loading;
  final String? disputingId;
  final List<ReviewDto> reviews;
  final Object? error;

  StylistReviewsState copyWith({
    bool? loading,
    String? disputingId,
    bool clearDisputing = false,
    List<ReviewDto>? reviews,
    Object? error,
    bool clearError = false,
  }) => StylistReviewsState(
    loading: loading ?? this.loading,
    disputingId: clearDisputing ? null : disputingId ?? this.disputingId,
    reviews: reviews ?? this.reviews,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [loading, disputingId, reviews, error];
}
