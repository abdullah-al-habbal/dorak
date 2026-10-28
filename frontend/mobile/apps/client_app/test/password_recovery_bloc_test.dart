import 'package:bloc_test/bloc_test.dart';
import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/features/auth/password_recovery.bloc.dart';
import 'package:client_app/src/features/auth/password_recovery.event.dart';
import 'package:client_app/src/features/auth/password_recovery.state.dart';
import 'package:client_app/src/features/auth/recovery_signal.entity.dart';

import 'helpers/fakes.dart';

ValidationException emailNotRegistered() => const ValidationException(
  statusCode: 422,
  code: 'VALIDATION_FAILED',
  message: 'core::messages.validation_failed',
  errors: {
    'email': ['The selected email is invalid.'],
  },
);

ValidationException codeRejected() => const ValidationException(
  statusCode: 422,
  code: 'VALIDATION_FAILED',
  message: 'core::messages.validation_failed',
  errors: {
    'code': ['The code is invalid or has expired.'],
  },
);

void main() {
  late FakeAuthRepository repository;

  setUp(() => repository = FakeAuthRepository());

  PasswordRecoveryBloc bloc() => PasswordRecoveryBloc(repository);

  group('request a code', () {
    blocTest<PasswordRecoveryBloc, PasswordRecoveryState>(
      'stores the email and signals that a code was sent',
      build: bloc,
      act: (bloc) => bloc.add(const RecoveryCodeRequested('sara@example.com')),
      verify: (bloc) {
        expect(repository.forgotPasswordEmail, 'sara@example.com');
        expect(bloc.state.email, 'sara@example.com');
        expect(bloc.state.signal, RecoverySignal.codeSent);
        expect(bloc.state.error, isNull);
      },
    );

    blocTest<PasswordRecoveryBloc, PasswordRecoveryState>(
      'an unregistered email still advances, so the API cannot be used to '
      'enumerate accounts',
      build: () {
        repository.forgotPasswordError = emailNotRegistered();
        return bloc();
      },
      act: (bloc) =>
          bloc.add(const RecoveryCodeRequested('nobody@example.com')),
      verify: (bloc) {
        expect(
          bloc.state.signal,
          RecoverySignal.codeSent,
          reason:
              'the backend uses exists:clients,email, so surfacing the 422 '
              'would tell an attacker which addresses are registered',
        );
        expect(bloc.state.error, isNull);
        expect(bloc.state.fieldErrors, isEmpty);
      },
    );

    blocTest<PasswordRecoveryBloc, PasswordRecoveryState>(
      'a transport failure does not advance — the user genuinely cannot proceed',
      build: () {
        repository.forgotPasswordError = offline();
        return bloc();
      },
      act: (bloc) => bloc.add(const RecoveryCodeRequested('sara@example.com')),
      verify: (bloc) {
        expect(bloc.state.signal, RecoverySignal.none);
        expect(bloc.state.error, isA<NetworkException>());
        expect(bloc.state.isSubmitting, isFalse);
      },
    );
  });

  group('verify the code', () {
    blocTest<PasswordRecoveryBloc, PasswordRecoveryState>(
      'a code the server accepts is held in state and acknowledged',
      build: bloc,
      act: (bloc) async {
        bloc.add(const RecoveryCodeRequested('sara@example.com'));
        await pumpEventQueue();
        bloc.add(const RecoveryCodeEntered('123456'));
        await pumpEventQueue();
      },
      verify: (bloc) {
        expect(repository.verifyResetCodePayload, {
          'email': 'sara@example.com',
          'code': '123456',
        });
        expect(bloc.state.code, '123456');
        expect(bloc.state.hasCode, isTrue);
        expect(bloc.state.isSubmitting, isFalse);
        expect(bloc.state.signal, RecoverySignal.codeAccepted);
      },
    );

    blocTest<PasswordRecoveryBloc, PasswordRecoveryState>(
      'a wrong code never emits codeAccepted and surfaces on the OTP step',
      build: () {
        repository.verifyResetCodeError = codeRejected();
        return bloc();
      },
      act: (bloc) => bloc.add(const RecoveryCodeEntered('000000')),
      verify: (bloc) {
        expect(bloc.state.isCodeRejected, isTrue);
        expect(bloc.state.error, isA<ValidationException>());
        expect(bloc.state.isSubmitting, isFalse);
        expect(bloc.state.signal, RecoverySignal.none);
      },
      expect: () => [
        isA<PasswordRecoveryState>()
            .having((s) => s.isSubmitting, 'isSubmitting', isTrue)
            .having((s) => s.signal, 'signal', RecoverySignal.none),
        isA<PasswordRecoveryState>()
            .having((s) => s.isCodeRejected, 'isCodeRejected', isTrue)
            .having((s) => s.signal, 'signal', RecoverySignal.none),
      ],
    );

    blocTest<PasswordRecoveryBloc, PasswordRecoveryState>(
      'a transport failure does not accept the code',
      build: () {
        repository.verifyResetCodeError = offline();
        return bloc();
      },
      act: (bloc) => bloc.add(const RecoveryCodeEntered('123456')),
      verify: (bloc) {
        expect(bloc.state.error, isA<NetworkException>());
        expect(bloc.state.signal, RecoverySignal.none);
        expect(bloc.state.isSubmitting, isFalse);
      },
    );
  });

  group('reset the password', () {
    blocTest<PasswordRecoveryBloc, PasswordRecoveryState>(
      'submits the carried email and code with the new password',
      build: bloc,
      act: (bloc) async {
        bloc.add(const RecoveryCodeRequested('sara@example.com'));
        await pumpEventQueue();
        bloc.add(const RecoveryCodeEntered('123456'));
        await pumpEventQueue();
        bloc.add(
          const RecoveryPasswordSubmitted(
            password: 'newsecret123',
            passwordConfirmation: 'newsecret123',
          ),
        );
        await pumpEventQueue();
      },
      verify: (bloc) {
        expect(repository.resetPasswordPayload, {
          'email': 'sara@example.com',
          'code': '123456',
          'password': 'newsecret123',
          'password_confirmation': 'newsecret123',
        });
        expect(bloc.state.signal, RecoverySignal.passwordReset);
      },
    );

    blocTest<PasswordRecoveryBloc, PasswordRecoveryState>(
      'a code that expires between verify and reset still surfaces here',
      build: () {
        repository.resetPasswordError = codeRejected();
        return bloc();
      },
      act: (bloc) async {
        bloc.add(const RecoveryCodeEntered('000000'));
        await pumpEventQueue();
        bloc.add(
          const RecoveryPasswordSubmitted(
            password: 'newsecret123',
            passwordConfirmation: 'newsecret123',
          ),
        );
        await pumpEventQueue();
      },
      verify: (bloc) {
        expect(bloc.state.isCodeRejected, isTrue);
        expect(bloc.state.firstErrorFor('code'), isNotNull);
        expect(bloc.state.signal, RecoverySignal.none);
      },
    );
  });

  group('lifecycle', () {
    blocTest<PasswordRecoveryBloc, PasswordRecoveryState>(
      'acknowledging clears the signal but keeps the carried values',
      build: bloc,
      act: (bloc) async {
        bloc.add(const RecoveryCodeRequested('sara@example.com'));
        await pumpEventQueue();
        bloc.add(RecoverySignalAcknowledged());
        await pumpEventQueue();
      },
      verify: (bloc) {
        expect(bloc.state.signal, RecoverySignal.none);
        expect(bloc.state.email, 'sara@example.com');
      },
    );
  });
}
