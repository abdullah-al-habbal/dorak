/// Mirrors `Modules\Feedback\Enums\FeedbackAppEnum` (the apps; the dashboard and the website send their own).
enum FeedbackApp {
  client('client'),
  business('business'),
  stylist('stylist');

  const FeedbackApp(this.wire);

  final String wire;
}
