/// Why a feedback attempt failed, in terms a screen can translate.
enum FeedbackFailure {
  /// 429: too many reports from this device or address.
  rateLimited,

  /// 422: the backend refused the content.
  invalid,

  /// No connection or a timeout.
  network,

  /// Anything else, including a server error.
  unknown,
}
