import 'package:core/src/network/api.client.dart';
import 'package:core/src/network/dto/token_response.dto.dart';
import 'package:core/src/network/endpoints/barber_auth.endpoints.dart';

/// Barber self sign-up. A new account starts `pending` until an admin
/// activates it; the token returned by [register] only reaches the profile
/// and email-verification routes, so callers must not treat it as a session.
abstract class BarberRegistrationRepository {
  Future<String> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
    required bool isFreelancer,
  });

  /// Both calls authenticate with the token the [ApiClient] provides, which
  /// during sign-up must be the token returned by [register].
  Future<void> sendEmailVerification();

  Future<void> verifyEmail(String code);
}

class DioBarberRegistrationRepository implements BarberRegistrationRepository {
  const DioBarberRegistrationRepository(this._client);

  final ApiClient _client;

  @override
  Future<String> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
    required bool isFreelancer,
  }) async {
    final response = await _client.post(
      BarberAuthEndpoints.register,
      data: {
        'name': name,
        'email': email,
        'password': password,
        'password_confirmation': passwordConfirmation,
        'is_freelancer': isFreelancer,
      },
      parser: (json) => TokenResponseDto.fromJson(json as Map<String, dynamic>),
    );
    if (response.token.isEmpty) {
      throw const FormatException('Registration response has no token');
    }
    return response.token;
  }

  @override
  Future<void> sendEmailVerification() => _client.post<void>(
    BarberAuthEndpoints.sendEmailVerification,
    parser: _discardBody,
  );

  @override
  Future<void> verifyEmail(String code) => _client.post<void>(
    BarberAuthEndpoints.verifyEmail,
    data: {'code': code},
    parser: _discardBody,
  );

  static void _discardBody(dynamic _) {}
}
