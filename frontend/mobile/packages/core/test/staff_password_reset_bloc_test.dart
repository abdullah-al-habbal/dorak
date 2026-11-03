import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late _Repository repository;
  late StaffPasswordResetBloc bloc;

  setUp(() {
    repository = _Repository();
    bloc = StaffPasswordResetBloc(repository);
  });

  tearDown(() => bloc.close());

  test('requesting a code moves to the code step', () async {
    await bloc.requestCode('a@b.com');

    expect(repository.requestedEmail, 'a@b.com');
    expect(bloc.state.step, StaffPasswordResetStep.code);
    expect(bloc.state.email, 'a@b.com');
  });

  test('a failed request stays on the email step with the error', () async {
    repository.failure = StateError('offline');

    await bloc.requestCode('a@b.com');

    expect(bloc.state.step, StaffPasswordResetStep.email);
    expect(bloc.state.error, isA<StateError>());
    expect(bloc.state.isSubmitting, isFalse);
  });

  test('resetting needs a requested code first', () async {
    await bloc.resetPassword(
      code: '123456',
      password: 'new-password-2',
      passwordConfirmation: 'new-password-2',
    );

    expect(repository.resetCode, isNull);
    expect(bloc.state.step, StaffPasswordResetStep.email);
  });

  test('a valid code and password finish the flow', () async {
    await bloc.requestCode('a@b.com');
    await bloc.resetPassword(
      code: '123456',
      password: 'new-password-2',
      passwordConfirmation: 'new-password-2',
    );

    expect(repository.resetCode, '123456');
    expect(repository.resetEmail, 'a@b.com');
    expect(bloc.state.step, StaffPasswordResetStep.done);
  });

  test('a rejected code keeps the code step so it can be retried', () async {
    await bloc.requestCode('a@b.com');
    repository.failure = StateError('422');

    await bloc.resetPassword(
      code: '000000',
      password: 'new-password-2',
      passwordConfirmation: 'new-password-2',
    );

    expect(bloc.state.step, StaffPasswordResetStep.code);
    expect(bloc.state.error, isNotNull);
    expect(bloc.state.isSubmitting, isFalse);
  });
}

class _Repository implements StaffAuthRepository {
  Object? failure;
  String? requestedEmail;
  String? resetEmail;
  String? resetCode;

  @override
  Future<void> forgotPassword(String email) async {
    if (failure != null) throw failure!;
    requestedEmail = email;
  }

  @override
  Future<void> resetPassword({
    required String email,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) async {
    if (failure != null) throw failure!;
    resetEmail = email;
    resetCode = code;
  }

  @override
  Future<String> login({required String email, required String password}) =>
      throw UnimplementedError();

  @override
  Future<void> logout() => throw UnimplementedError();

  @override
  Future<String> refreshToken() => throw UnimplementedError();
}
