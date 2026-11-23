import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('the error codes match what the backend envelope sends', () {
    expect(ApiErrorCodeConstants.apiErrorCodeAccountBanned, 'ACCOUNT_BANNED');
    expect(
      ApiErrorCodeConstants.apiErrorCodeAccountNotActive,
      'ACCOUNT_NOT_ACTIVE',
    );
    expect(
      ApiErrorCodeConstants.apiErrorCodeValidationFailed,
      'VALIDATION_FAILED',
    );
    expect(ApiErrorCodeConstants.apiErrorCodeNetworkError, 'NETWORK_ERROR');
  });
}
