import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

ApiException _api(int status, String code) =>
    ApiException(statusCode: status, code: code, message: 'raw');

void main() {
  final cases = <String, (Object, ApiFailureKind)>{
    'no response': (
      const NetworkException(
        type: DioExceptionType.connectionTimeout,
        retryable: true,
        message: 'raw',
      ),
      ApiFailureKind.network,
    ),
    'not an API failure': (StateError('x'), ApiFailureKind.unknown),
    'a format error': (const FormatException(), ApiFailureKind.unknown),
    'field errors': (
      const ValidationException(
        statusCode: 422,
        code: 'VALIDATION_FAILED',
        message: 'raw',
        errors: {},
      ),
      ApiFailureKind.validation,
    ),
    'generic 422': (
      _api(422, 'UNPROCESSABLE_ENTITY'),
      ApiFailureKind.validation,
    ),
    'generic 401': (_api(401, 'UNAUTHORIZED'), ApiFailureKind.unauthorized),
    'uncoded 401': (_api(401, 'UNKNOWN'), ApiFailureKind.unauthorized),
    'generic 403': (_api(403, 'FORBIDDEN'), ApiFailureKind.forbidden),
    'a ban': (_api(403, 'ACCOUNT_BANNED'), ApiFailureKind.forbidden),
    'a missing ability': (
      _api(403, 'TOKEN_ABILITY_MISSING'),
      ApiFailureKind.forbidden,
    ),
    'generic 409': (_api(409, 'CONFLICT'), ApiFailureKind.conflict),
    'rate limit': (_api(429, 'TOO_MANY_REQUESTS'), ApiFailureKind.rateLimited),
    'server error': (_api(500, 'SERVER_ERROR'), ApiFailureKind.server),
    'unavailable': (_api(503, 'SERVICE_UNAVAILABLE'), ApiFailureKind.server),
    'a proxy page': (_api(502, 'INVALID_RESPONSE'), ApiFailureKind.server),
    'a broken 200': (_api(200, 'INVALID_RESPONSE'), ApiFailureKind.unknown),
    'not found': (_api(404, 'RESOURCE_NOT_FOUND'), ApiFailureKind.unknown),
    'bad request': (_api(400, 'BAD_REQUEST'), ApiFailureKind.unknown),
    'a coded 403': (_api(403, 'brand_suspended'), ApiFailureKind.businessCode),
    'a coded 409': (
      _api(409, 'ACCOUNT_HAS_ACTIVE_BOOKINGS'),
      ApiFailureKind.businessCode,
    ),
    'a coded 422': (
      _api(422, 'booking_outside_schedule'),
      ApiFailureKind.businessCode,
    ),
    'a premium feature': (
      const FeatureNotEnabledException(
        statusCode: 403,
        code: 'feature_not_enabled',
        message: 'raw',
        feature: null,
      ),
      ApiFailureKind.businessCode,
    ),
  };

  for (final MapEntry(key: name, value: (error, expected)) in cases.entries) {
    test('$name is ${expected.name}', () {
      expect(ApiFailureKind.from(error), expected);
    });
  }

  test('every kind is covered', () {
    expect(
      cases.values.map((entry) => entry.$2).toSet(),
      ApiFailureKind.values.toSet(),
    );
  });
}
