import 'package:dio/dio.dart';

import 'package:core/src/network/interceptors/auth_interceptor_constants.entity.dart';
import 'package:core/src/network/exceptions/api_error_code_constants.entity.dart';

class AuthInterceptor extends Interceptor {
  final Future<String?> Function() tokenProvider;
  final void Function() reportUnauthorized;
  final void Function() reportAccountBanned;

  AuthInterceptor({
    required this.tokenProvider,
    required this.reportUnauthorized,
    required this.reportAccountBanned,
  });

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await tokenProvider();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final status = err.response?.statusCode;
    final path = err.requestOptions.path;
    final carriedBearer =
        (err.requestOptions.headers['Authorization'] as String?)?.startsWith(
          'Bearer ',
        ) ??
        false;
    final isAuthLifecycle =
        AuthInterceptorConstants.authInterceptorLifecyclePaths.contains(path) ||
        path.startsWith(
          AuthInterceptorConstants.authInterceptorSocialPathPrefix,
        );

    if (carriedBearer && !isAuthLifecycle && (status == 401 || status == 403)) {
      final body = err.response?.data;
      final code = body is Map ? body['code'] : null;
      if (code == ApiErrorCodeConstants.apiErrorCodeAccountBanned) {
        reportAccountBanned();
      } else if (status == 403 &&
          AuthInterceptorConstants.authInterceptorBusinessForbiddenCodes
              .contains(code)) {
        // A business rejection of one action, not a session problem.
      } else if (status == 401 &&
          err.requestOptions.extra[AuthInterceptorConstants
                  .authInterceptorKeepSessionOn401Key] ==
              true) {
        // The call rejected the credential it was sent, not the bearer token.
      } else {
        reportUnauthorized();
      }
    }

    handler.next(err);
  }
}
