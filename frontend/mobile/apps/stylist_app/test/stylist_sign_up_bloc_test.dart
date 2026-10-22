import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:stylist_app/src/features/auth/stylist_sign_up.bloc.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up.state.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up_step.entity.dart';

import 'helpers/sign_up_fakes.dart';

void main() {
  late FakeBarberRegistrationRepository repository;
  late StylistSignUpBloc bloc;

  setUp(() {
    repository = FakeBarberRegistrationRepository();
    bloc = StylistSignUpBloc(repository);
  });

  tearDown(() => bloc.close());

  Future<void> register() => bloc.register(
    name: 'Omar',
    email: 'omar@example.com',
    password: 'secret-pass-1',
    passwordConfirmation: 'secret-pass-1',
    isFreelancer: true,
  );

  test('registering sends the form and moves to email verification', () async {
    await register();

    expect(repository.registeredPayload, {
      'name': 'Omar',
      'email': 'omar@example.com',
      'password': 'secret-pass-1',
      'password_confirmation': 'secret-pass-1',
      'is_freelancer': true,
    });
    expect(bloc.state.step, StylistSignUpStep.verifyEmail);
    expect(bloc.state.onboardingToken, 'onboarding-token');
    expect(bloc.state.email, 'omar@example.com');
    expect(bloc.state.isSubmitting, isFalse);
  });

  test('a taken email stays on the form with the field error', () async {
    repository.registerError = fieldRejected('email');

    await register();

    expect(bloc.state.step, StylistSignUpStep.form);
    expect(bloc.state.hasFieldError('email'), isTrue);
    expect(bloc.state.onboardingToken, isNull);
  });

  test('a server failure stays on the form', () async {
    repository.registerError = const ApiException(
      statusCode: 500,
      code: 'SERVER_ERROR',
      message: 'core::messages.server_error',
    );

    await register();

    expect(bloc.state.step, StylistSignUpStep.form);
    expect(bloc.state.error, isA<ApiException>());
    expect(bloc.state.isSubmitting, isFalse);
  });

  test('a correct code moves to the pending-approval step', () async {
    await register();
    await bloc.verifyEmail('123456');

    expect(repository.verifiedCode, '123456');
    expect(bloc.state.step, StylistSignUpStep.pending);
  });

  test('a wrong code stays on verification with the code error', () async {
    repository.verifyError = fieldRejected('code');
    await register();

    await bloc.verifyEmail('000000');

    expect(bloc.state.step, StylistSignUpStep.verifyEmail);
    expect(bloc.state.hasFieldError('code'), isTrue);
  });

  test('resending requests a new code', () async {
    await register();
    await bloc.resendCode();

    expect(repository.resendCalls, 1);
    expect(bloc.state.codeResent, isTrue);
  });

  test('verification can be skipped', () async {
    await register();
    bloc.skipVerification();

    expect(bloc.state.step, StylistSignUpStep.pending);
  });

  test('reset drops the onboarding token', () async {
    await register();
    bloc.reset();

    expect(bloc.state, StylistSignUpState());
    expect(bloc.state.onboardingToken, isNull);
  });
}
