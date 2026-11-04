import 'package:bloc_test/bloc_test.dart';
import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/features/auth/social_login.bloc.dart';
import 'package:client_app/src/features/auth/social_login.event.dart';
import 'package:client_app/src/features/auth/social_login.state.dart';

import 'helpers/fakes.dart';

void main() {
  group('SocialLoginBloc', () {
    blocTest<SocialLoginBloc, SocialLoginState>(
      'hands the provider token over once the SDK returns it',
      build: () => SocialLoginBloc(FakeSocialCredentialProvider()),
      act: (bloc) =>
          bloc.add(const SocialLoginStarted(SocialAuthProvider.google)),
      expect: () => const [
        SocialLoginState(
          status: SocialLoginStatus.authenticating,
          provider: SocialAuthProvider.google,
        ),
        SocialLoginState(
          status: SocialLoginStatus.credentialReady,
          provider: SocialAuthProvider.google,
          token: 'provider-token-123',
        ),
      ],
    );

    blocTest<SocialLoginBloc, SocialLoginState>(
      'a dismissed sheet is cancelled, not failed',
      build: () => SocialLoginBloc(FakeSocialCredentialProvider(token: null)),
      act: (bloc) =>
          bloc.add(const SocialLoginStarted(SocialAuthProvider.google)),
      expect: () => const [
        SocialLoginState(
          status: SocialLoginStatus.authenticating,
          provider: SocialAuthProvider.google,
        ),
        SocialLoginState(
          status: SocialLoginStatus.cancelled,
          provider: SocialAuthProvider.google,
        ),
      ],
    );

    blocTest<SocialLoginBloc, SocialLoginState>(
      'an empty token is a failure',
      build: () => SocialLoginBloc(FakeSocialCredentialProvider(token: '')),
      act: (bloc) =>
          bloc.add(const SocialLoginStarted(SocialAuthProvider.google)),
      expect: () => const [
        SocialLoginState(
          status: SocialLoginStatus.authenticating,
          provider: SocialAuthProvider.google,
        ),
        SocialLoginState(
          status: SocialLoginStatus.failed,
          provider: SocialAuthProvider.google,
        ),
      ],
    );

    blocTest<SocialLoginBloc, SocialLoginState>(
      'an SDK error fails without leaking a token',
      build: () => SocialLoginBloc(
        FakeSocialCredentialProvider(error: StateError('sdk')),
      ),
      act: (bloc) =>
          bloc.add(const SocialLoginStarted(SocialAuthProvider.google)),
      expect: () => const [
        SocialLoginState(
          status: SocialLoginStatus.authenticating,
          provider: SocialAuthProvider.google,
        ),
        SocialLoginState(
          status: SocialLoginStatus.failed,
          provider: SocialAuthProvider.google,
        ),
      ],
    );

    blocTest<SocialLoginBloc, SocialLoginState>(
      'an unsupported provider fails without calling the SDK',
      build: () => SocialLoginBloc(FakeSocialCredentialProvider(supported: {})),
      act: (bloc) =>
          bloc.add(const SocialLoginStarted(SocialAuthProvider.google)),
      expect: () => const [
        SocialLoginState(
          status: SocialLoginStatus.failed,
          provider: SocialAuthProvider.google,
        ),
      ],
    );
  });
}
