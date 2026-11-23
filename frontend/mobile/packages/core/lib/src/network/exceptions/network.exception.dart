import 'package:core/src/network/exceptions/api.exception.dart';
import 'package:dio/dio.dart';
import 'package:core/src/network/exceptions/api_error_code_constants.entity.dart';

class NetworkException extends ApiException {
  final DioExceptionType type;
  final bool retryable;

  const NetworkException({
    required this.type,
    required this.retryable,
    required super.message,
  }) : super(
         statusCode: 0,
         code: ApiErrorCodeConstants.apiErrorCodeNetworkError,
       );
}
