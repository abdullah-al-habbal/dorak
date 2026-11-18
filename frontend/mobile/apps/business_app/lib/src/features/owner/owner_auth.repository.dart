import 'package:core/core.dart';

/// Signs a brand owner in as a client (owners are clients that own a brand). It
/// speaks the staff contract so the staff session and password-reset blocs work
/// unchanged; whether the client actually owns a brand is checked by `OwnerHomeCubit`.
class OwnerAuthRepository implements StaffAuthRepository {
  const OwnerAuthRepository(this._auth);

  final AuthRepository _auth;

  @override
  Future<String> login({
    required String email,
    required String password,
  }) async {
    final response = await _auth.login(email: email, password: password);
    if (response.token.isEmpty) {
      throw const FormatException('Authentication response has no token');
    }
    return response.token;
  }

  @override
  Future<void> logout() => _auth.logout();

  @override
  Future<String> refreshToken() => _auth.refreshToken();

  @override
  Future<void> forgotPassword(String email) => _auth.forgotPassword(email);

  @override
  Future<void> resetPassword({
    required String email,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) => _auth.resetPassword(
    email: email,
    code: code,
    password: password,
    passwordConfirmation: passwordConfirmation,
  );
}
