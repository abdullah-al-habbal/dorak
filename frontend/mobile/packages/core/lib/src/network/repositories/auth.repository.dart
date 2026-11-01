import 'package:core/core.dart';

abstract class AuthRepository {
  Future<AuthResponseDto> login({
    required String email,
    required String password,
  });

  Future<AuthResponseDto> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
    String? phone,
  });

  Future<void> logout();

  Future<String> refreshToken();

  Future<void> sendEmailVerification();

  Future<void> verifyEmail(String code);

  Future<void> forgotPassword(String email);

  /// Checks a password-reset code without consuming it. Throws a
  /// `ValidationException` with a `code` field error when the code is wrong,
  /// expired, or invalidated after too many attempts.
  Future<void> verifyResetCode({required String email, required String code});

  Future<void> resetPassword({
    required String email,
    required String code,
    required String password,
    required String passwordConfirmation,
  });

  Future<void> changePassword({
    required String currentPassword,
    required String password,
    required String passwordConfirmation,
  });
  Future<void> socialLogin({
    required SocialAuthProvider provider,
    required String accessToken,
  });
  Future<void> deleteAccount(String password);
}

class DioAuthRepository implements AuthRepository {
  final ApiClient _client;

  DioAuthRepository(this._client);

  @override
  Future<AuthResponseDto> login({
    required String email,
    required String password,
  }) {
    return _client.post(
      ApiEndpoints.auth.login,
      data: {'email': email, 'password': password},
      parser: (json) => AuthResponseDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<AuthResponseDto> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
    String? phone,
  }) {
    return _client.post(
      ApiEndpoints.auth.register,
      data: {
        'name': name,
        'email': email,
        'password': password,
        'password_confirmation': passwordConfirmation,
        'phone': ?phone,
      },
      parser: (json) => AuthResponseDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<void> logout() {
    return _client.post<void>(ApiEndpoints.auth.logout, parser: _discardBody);
  }

  @override
  Future<String> refreshToken() async {
    final response = await _client.post(
      ApiEndpoints.auth.refreshToken,
      parser: (json) => TokenResponseDto.fromJson(json as Map<String, dynamic>),
    );
    return response.token;
  }

  @override
  Future<void> sendEmailVerification() {
    return _client.post<void>(
      ApiEndpoints.auth.sendEmailVerification,
      parser: _discardBody,
    );
  }

  @override
  Future<void> verifyEmail(String code) {
    return _client.post<void>(
      ApiEndpoints.auth.verifyEmail,
      data: {'code': code},
      parser: _discardBody,
    );
  }

  @override
  Future<void> forgotPassword(String email) {
    return _client.post<void>(
      ApiEndpoints.auth.forgotPassword,
      data: {'email': email},
      parser: _discardBody,
    );
  }

  @override
  Future<void> verifyResetCode({required String email, required String code}) {
    return _client.post<void>(
      ApiEndpoints.auth.verifyResetCode,
      data: {'email': email, 'code': code},
      parser: _discardBody,
    );
  }

  @override
  Future<void> resetPassword({
    required String email,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) {
    return _client.post<void>(
      ApiEndpoints.auth.resetPassword,
      data: {
        'email': email,
        'code': code,
        'password': password,
        'password_confirmation': passwordConfirmation,
      },
      parser: _discardBody,
    );
  }

  @override
  Future<void> changePassword({
    required String currentPassword,
    required String password,
    required String passwordConfirmation,
  }) {
    return _client.patch<void>(
      ApiEndpoints.auth.changePassword,
      data: {
        'current_password': currentPassword,
        'password': password,
        'password_confirmation': passwordConfirmation,
      },
      parser: _discardBody,
    );
  }

  @override
  Future<void> socialLogin({
    required SocialAuthProvider provider,
    required String accessToken,
  }) {
    return _client.post<void>(
      ApiEndpoints.auth.socialLogin(provider.value),
      data: {'access_token': accessToken},
      parser: _discardBody,
    );
  }

  @override
  Future<void> deleteAccount(String password) => _client.delete(
    ApiEndpoints.auth.deleteAccount,
    data: {'password': password},
  );

  static void _discardBody(dynamic _) {}
}
