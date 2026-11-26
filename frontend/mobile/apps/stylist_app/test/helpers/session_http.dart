import 'dart:convert';
import 'dart:typed_data';

import 'package:core/core.dart';
import 'package:dio/dio.dart';

/// Answers every request with one error envelope.
class _AnsweringAdapter implements HttpClientAdapter {
  _AnsweringAdapter(this.status, this.code);

  final int status;
  final String code;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async => ResponseBody.fromString(
    jsonEncode({
      'success': false,
      'statusCode': status,
      'code': code,
      'message': code,
    }),
    status,
    headers: {
      'content-type': ['application/json'],
    },
  );

  @override
  void close({bool force = false}) {}
}

/// A real client with a bearer token, so `AuthInterceptor` is installed.
ApiClient sessionApiClient(
  int status,
  String code,
  Future<String?> Function() tokenProvider,
) {
  final dio = Dio(BaseOptions(baseUrl: 'http://test/api/v1'))
    ..httpClientAdapter = _AnsweringAdapter(status, code);
  return ApiClient(
    baseUrl: 'http://test/api/v1',
    dio: dio,
    enableLogging: false,
    maxRetries: 0,
    tokenProvider: tokenProvider,
  );
}
