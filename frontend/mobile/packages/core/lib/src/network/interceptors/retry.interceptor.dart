import 'package:dio/dio.dart';
import 'package:core/src/network/interceptors/retry_interceptor_constants.entity.dart';

class RetryInterceptor extends Interceptor {
  final Dio dio;
  final int maxRetries;
  final Duration Function(int attempt) backoffFor;

  RetryInterceptor({
    required this.dio,
    this.maxRetries = 3,
    Duration Function(int attempt)? backoffFor,
  }) : backoffFor = backoffFor ?? _defaultBackoff;

  static Duration _defaultBackoff(int attempt) {
    return Duration(milliseconds: 500 * (1 << (attempt - 1)));
  }

  static bool isRetryable(DioException err) {
    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.connectionError:
        return true;
      case DioExceptionType.badResponse:
        final status = err.response?.statusCode ?? 0;
        return status == 429 || status >= 500;
      default:
        return false;
    }
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.type == DioExceptionType.cancel) {
      handler.next(err);
      return;
    }

    final method = err.requestOptions.method.toUpperCase();
    if (!RetryInterceptorConstants.retryInterceptorIdempotentMethods.contains(
          method,
        ) ||
        !isRetryable(err)) {
      handler.next(err);
      return;
    }

    final retried =
        (err.requestOptions.extra[RetryInterceptorConstants
                .retryInterceptorCountKey]
            as int?) ??
        0;
    if (retried >= maxRetries) {
      handler.next(err);
      return;
    }

    err.requestOptions.extra[RetryInterceptorConstants
            .retryInterceptorCountKey] =
        retried + 1;
    await Future<void>.delayed(backoffFor(retried + 1));

    try {
      final response = await dio.fetch<dynamic>(err.requestOptions);
      handler.resolve(response);
    } catch (e) {
      handler.next(e is DioException ? e : err);
    }
  }
}
