import 'package:core/core.dart';

class FakeBarberRegistrationRepository implements BarberRegistrationRepository {
  Object? registerError;
  Object? verifyError;
  Map<String, Object?>? registeredPayload;
  String? verifiedCode;
  int resendCalls = 0;

  @override
  Future<String> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
    required bool isFreelancer,
  }) async {
    registeredPayload = {
      'name': name,
      'email': email,
      'password': password,
      'password_confirmation': passwordConfirmation,
      'is_freelancer': isFreelancer,
    };
    final error = registerError;
    if (error != null) throw error;
    return 'onboarding-token';
  }

  @override
  Future<void> sendEmailVerification() async => resendCalls++;

  @override
  Future<void> verifyEmail(String code) async {
    verifiedCode = code;
    final error = verifyError;
    if (error != null) throw error;
  }
}

class FakeStaffAuthRepository implements StaffAuthRepository {
  Object? loginError;

  @override
  Future<String> login({
    required String email,
    required String password,
  }) async {
    final error = loginError;
    if (error != null) throw error;
    return 'staff-token';
  }

  bool loggedOut = false;
  String? forgotEmail;
  String? resetCode;
  Object? resetError;

  @override
  Future<void> logout() async => loggedOut = true;

  @override
  Future<String> refreshToken() async => 'refreshed-token';

  @override
  Future<void> forgotPassword(String email) async => forgotEmail = email;

  @override
  Future<void> resetPassword({
    required String email,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) async {
    final error = resetError;
    if (error != null) throw error;
    resetCode = code;
  }
}

class InMemoryStaffTokenStorage implements TokenStorage {
  String? token;

  @override
  Future<void> clear() async => token = null;

  @override
  Future<String?> read() async => token;

  @override
  Future<void> write(String value) async => token = value;
}

ValidationException fieldRejected(String field) => ValidationException(
  statusCode: 422,
  code: 'VALIDATION_FAILED',
  message: 'core::messages.validation_failed',
  errors: {
    field: ['rejected'],
  },
);
