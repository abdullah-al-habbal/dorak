class FeedbackEndpoints {
  FeedbackEndpoints._();

  /// `POST /feedback`: open to guests and signed-in users; the user comes from the token.
  static const String submit = '/feedback';
}
