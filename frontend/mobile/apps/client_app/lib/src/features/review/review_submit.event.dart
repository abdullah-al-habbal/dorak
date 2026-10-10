import 'package:equatable/equatable.dart';

sealed class ReviewSubmitEvent extends Equatable {
  const ReviewSubmitEvent();

  @override
  List<Object?> get props => [];
}

class ReviewSubmitStarted extends ReviewSubmitEvent {
  const ReviewSubmitStarted(
    this.bookingId, {
    required this.rating,
    this.comment,
  });

  final String bookingId;
  final int rating;
  final String? comment;

  @override
  List<Object?> get props => [bookingId, rating, comment];
}

class ReviewSubmitRetried extends ReviewSubmitEvent {
  const ReviewSubmitRetried();
}
