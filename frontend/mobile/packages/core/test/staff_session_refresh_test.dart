import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_auth.dart';

class _NoopStaffAuthRepository implements StaffAuthRepository {
  @override
  Future<String> login({
    required String email,
    required String password,
  }) async => 'token';

  @override
  Future<void> logout() async {}

  @override
  Future<String> refreshToken() async => 'token';

  @override
  Future<void> forgotPassword(String email) async {}

  @override
  Future<void> resetPassword({
    required String email,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) async {}
}

void main() {
  test('notifies on session changes and stops after dispose', () async {
    final session = StaffSessionBloc(
      _NoopStaffAuthRepository(),
      InMemoryTokenStorage('stored'),
    );
    final refresh = StaffSessionRefresh(session);
    var notifications = 0;
    refresh.addListener(() => notifications++);

    await session.restore();
    await Future<void>.delayed(Duration.zero);
    expect(notifications, 1);

    refresh.dispose();
    await session.logout();
    await Future<void>.delayed(Duration.zero);
    expect(notifications, 1);
    await session.close();
  });
}
