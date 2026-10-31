class RetryInterceptorConstants {
  const RetryInterceptorConstants._();

  static const String retryInterceptorCountKey = 'retry_count';
  static const Set<String> retryInterceptorIdempotentMethods = {
    'GET',
    'PUT',
    'PATCH',
    'DELETE',
  };
}
