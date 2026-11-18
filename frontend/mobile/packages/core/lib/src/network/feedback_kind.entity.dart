/// Mirrors `Modules\Feedback\Enums\FeedbackKindEnum`.
enum FeedbackKind {
  suggestion('suggestion'),
  bug('bug'),
  support('support');

  const FeedbackKind(this.wire);

  final String wire;
}
