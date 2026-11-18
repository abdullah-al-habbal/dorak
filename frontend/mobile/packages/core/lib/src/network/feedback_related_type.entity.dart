/// Mirrors `Modules\Feedback\Enums\FeedbackRelatedTypeEnum`.
enum FeedbackRelatedType {
  booking('booking'),
  branch('branch'),
  brand('brand'),
  barber('barber'),
  review('review');

  const FeedbackRelatedType(this.wire);

  final String wire;
}
