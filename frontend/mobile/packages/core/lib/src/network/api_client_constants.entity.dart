class ApiClientConstants {
  const ApiClientConstants._();

  static const Duration apiClientDefaultConnectTimeout = Duration(seconds: 15);
  static const Duration apiClientDefaultReceiveTimeout = Duration(seconds: 30);

  /// Header that lets the server recognise a retry of one booking submission.
  static const String apiClientIdempotencyHeader = 'Idempotency-Key';
}
