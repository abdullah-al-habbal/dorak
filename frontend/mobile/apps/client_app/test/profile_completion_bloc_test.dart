import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/features/profile/profile_completion.bloc.dart';
import 'package:client_app/src/features/profile/profile_completion.event.dart';
import 'package:client_app/src/features/profile/profile_completion.state.dart';

import 'helpers/fakes.dart';

void main() {
  blocTest<ProfileCompletionBloc, ProfileCompletionState>(
    'persists completion after updating the supported backend profile fields',
    build: () {
      final preferences = InMemoryAppPreferences(profileCompleted: false);
      final repository = FakeProfileRepository();
      return ProfileCompletionBloc(repository, preferences);
    },
    act: (bloc) => bloc.add(
      const ProfileCompletionSubmitted(name: 'Sara', phone: '+963900000000'),
    ),
    verify: (bloc) {
      expect(bloc.state.completed, isTrue);
      expect(bloc.state.phoneToVerify, '+963900000000');
    },
  );

  blocTest<ProfileCompletionBloc, ProfileCompletionState>(
    'does not ask to verify an unchanged phone',
    build: () => ProfileCompletionBloc(
      FakeProfileRepository(),
      InMemoryAppPreferences(profileCompleted: false),
    ),
    act: (bloc) => bloc.add(
      const ProfileCompletionSubmitted(
        name: 'Sara',
        phone: '+963900000000',
        currentPhone: '+963900000000',
      ),
    ),
    verify: (bloc) {
      expect(bloc.state.completed, isTrue);
      expect(bloc.state.phoneToVerify, isNull);
    },
  );
}
