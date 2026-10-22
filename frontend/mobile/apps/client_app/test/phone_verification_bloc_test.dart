import 'package:bloc_test/bloc_test.dart';
import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/features/profile/phone_verification.bloc.dart';
import 'package:client_app/src/features/profile/phone_verification.event.dart';
import 'package:client_app/src/features/profile/phone_verification.state.dart';
import 'package:client_app/src/features/profile/phone_verification_status.entity.dart';

import 'helpers/fakes.dart';

const _phone = '+963911222333';
const _unprocessable = ApiException(
  statusCode: 422,
  code: 'UNPROCESSABLE_ENTITY',
  message: 'bad',
);

void main() {
  late FakeProfileRepository repository;

  setUp(() => repository = FakeProfileRepository());

  blocTest<PhoneVerificationBloc, PhoneVerificationState>(
    'requesting a code moves through requesting to codeSent',
    build: () => PhoneVerificationBloc(repository, _phone),
    act: (bloc) => bloc.add(const PhoneVerificationRequested()),
    expect: () => [
      const PhoneVerificationState(
        phone: _phone,
        status: PhoneVerificationStatus.requesting,
      ),
      const PhoneVerificationState(
        phone: _phone,
        status: PhoneVerificationStatus.codeSent,
      ),
    ],
    verify: (_) {
      expect(repository.requestOtpCalls, 1);
      expect(repository.lastOtpPhone, _phone);
    },
  );

  blocTest<PhoneVerificationBloc, PhoneVerificationState>(
    'a rejected send surfaces requestFailed with the error',
    setUp: () => repository.requestOtpError = _unprocessable,
    build: () => PhoneVerificationBloc(repository, _phone),
    act: (bloc) => bloc.add(const PhoneVerificationRequested()),
    verify: (bloc) {
      expect(bloc.state.status, PhoneVerificationStatus.requestFailed);
      expect(bloc.state.error, _unprocessable);
    },
  );

  blocTest<PhoneVerificationBloc, PhoneVerificationState>(
    'a correct code verifies the phone and returns the client',
    build: () => PhoneVerificationBloc(repository, _phone),
    act: (bloc) => bloc
      ..add(const PhoneVerificationRequested())
      ..add(const PhoneVerificationSubmitted('123456')),
    verify: (bloc) {
      expect(bloc.state.status, PhoneVerificationStatus.verified);
      expect(bloc.state.client?.phoneVerified, isTrue);
      expect(repository.lastOtpCode, '123456');
    },
  );

  blocTest<PhoneVerificationBloc, PhoneVerificationState>(
    'a wrong code surfaces verifyFailed and can be retried',
    setUp: () => repository.verifyOtpError = _unprocessable,
    build: () => PhoneVerificationBloc(repository, _phone),
    act: (bloc) async {
      bloc.add(const PhoneVerificationSubmitted('000000'));
      await Future<void>.delayed(Duration.zero);
      repository.verifyOtpError = null;
      bloc.add(const PhoneVerificationSubmitted('123456'));
    },
    expect: () => [
      isA<PhoneVerificationState>().having(
        (s) => s.status,
        'status',
        PhoneVerificationStatus.verifying,
      ),
      isA<PhoneVerificationState>()
          .having(
            (s) => s.status,
            'status',
            PhoneVerificationStatus.verifyFailed,
          )
          .having((s) => s.error, 'error', _unprocessable),
      isA<PhoneVerificationState>().having(
        (s) => s.status,
        'status',
        PhoneVerificationStatus.verifying,
      ),
      isA<PhoneVerificationState>().having(
        (s) => s.status,
        'status',
        PhoneVerificationStatus.verified,
      ),
    ],
  );
}
