import 'package:bloc_test/bloc_test.dart';
import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/features/profile/delete_account.bloc.dart';
import 'package:client_app/src/features/profile/delete_account.event.dart';
import 'package:client_app/src/features/profile/delete_account.state.dart';

import 'helpers/fakes.dart';

void main() {
  late FakeAuthRepository repository;

  setUp(() => repository = FakeAuthRepository());

  DeleteAccountBloc bloc() => DeleteAccountBloc(repository);

  blocTest<DeleteAccountBloc, DeleteAccountState>(
    'a confirmed password deletes the account',
    build: bloc,
    act: (bloc) => bloc.add(const DeleteAccountSubmitted('secret123')),
    expect: () => const [
      DeleteAccountState(isSubmitting: true),
      DeleteAccountState(succeeded: true),
    ],
    verify: (_) {
      expect(repository.deleteAccountCalls, 1);
      expect(repository.lastDeletePassword, 'secret123');
    },
  );

  blocTest<DeleteAccountBloc, DeleteAccountState>(
    'an empty password never reaches the API',
    build: bloc,
    act: (bloc) => bloc.add(const DeleteAccountSubmitted('')),
    expect: () => const <DeleteAccountState>[],
    verify: (_) => expect(repository.deleteAccountCalls, 0),
  );

  blocTest<DeleteAccountBloc, DeleteAccountState>(
    'active bookings keep the 409 error and do not succeed',
    build: bloc,
    setUp: () => repository.deleteAccountError = const ApiException(
      message: 'blocked',
      statusCode: 409,
      code: 'ACCOUNT_HAS_ACTIVE_BOOKINGS',
    ),
    act: (bloc) => bloc.add(const DeleteAccountSubmitted('secret123')),
    verify: (bloc) {
      expect(bloc.state.succeeded, isFalse);
      expect((bloc.state.error as ApiException).statusCode, 409);
    },
  );
}
