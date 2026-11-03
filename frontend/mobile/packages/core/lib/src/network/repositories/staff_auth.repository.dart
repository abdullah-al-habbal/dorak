import 'package:core/core.dart';

abstract class StaffAuthRepository {
  Future<String> login({required String email, required String password});

  /// Revokes the current server-side token.
  Future<void> logout();

  /// Swaps the current token for a fresh one and returns it.
  Future<String> refreshToken();

  /// Always succeeds for a well-formed email; the backend never reveals
  /// whether the address belongs to an account.
  Future<void> forgotPassword(String email);

  /// Throws a 422 [ApiException] for a wrong, expired or used code.
  Future<void> resetPassword({
    required String email,
    required String code,
    required String password,
    required String passwordConfirmation,
  });
}

class DioStaffAuthRepository implements StaffAuthRepository {
  const DioStaffAuthRepository(this._client, this._routes);

  final ApiClient _client;
  final StaffAuthRoutes _routes;

  @override
  Future<String> login({
    required String email,
    required String password,
  }) async {
    final response = await _client.post(
      _routes.login,
      data: {'email': email, 'password': password},
      parser: (json) => TokenResponseDto.fromJson(json as Map<String, dynamic>),
    );
    if (response.token.isEmpty) {
      throw const FormatException('Authentication response has no token');
    }
    return response.token;
  }

  @override
  Future<void> logout() =>
      _client.post<void>(_routes.logout, parser: _discardBody);

  @override
  Future<String> refreshToken() async {
    final response = await _client.post(
      _routes.refreshToken,
      parser: (json) => TokenResponseDto.fromJson(json as Map<String, dynamic>),
    );
    if (response.token.isEmpty) {
      throw const FormatException('Refresh response has no token');
    }
    return response.token;
  }

  @override
  Future<void> forgotPassword(String email) => _client.post<void>(
    _routes.forgotPassword,
    data: {'email': email},
    parser: _discardBody,
  );

  @override
  Future<void> resetPassword({
    required String email,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) => _client.post<void>(
    _routes.resetPassword,
    data: {
      'email': email,
      'code': code,
      'password': password,
      'password_confirmation': passwordConfirmation,
    },
    parser: _discardBody,
  );

  static void _discardBody(dynamic _) {}
}
