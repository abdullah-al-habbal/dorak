import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/core/navigation/app.router.dart';
import 'package:client_app/src/core/navigation/app_routes.entity.dart';
import 'package:client_app/src/features/auth/login.screen.dart';
import 'package:client_app/src/features/discovery/discovery.screen.dart'
    as discovery_feed;

import 'helpers/fakes.dart';

void main() {
  late FakeAuthRepository repository;
  late InMemoryTokenStorage storage;
  late SessionBloc session;

  setUp(() {
    repository = FakeAuthRepository();
    storage = InMemoryTokenStorage();
  });

  Future<void> pumpLogin(
    WidgetTester tester,
    FakeSocialCredentialProvider credentials,
  ) async {
    tester.view.devicePixelRatio = 3.0;
    tester.view.physicalSize = const Size(430, 1200) * 3.0;
    addTearDown(tester.view.reset);

    final pair = sessionPair(repository, storage);
    session = pair.session;
    final AppRouter router = buildRouter(
      session: session,
      auth: pair.auth,
      preferences: InMemoryAppPreferences(),
      apiClient: fakeApiClient(),
      socialCredentials: credentials,
    );
    await tester.pumpWidget(routerHarness(router));
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pump(const Duration(seconds: 3));
    await tester.pumpAndSettle();
    router.router.go(AppRoutes.authLogin);
    await tester.pumpAndSettle();
  }

  testWidgets('Google sign-in exchanges the token and reaches Home', (
    tester,
  ) async {
    final credentials = FakeSocialCredentialProvider();
    await pumpLogin(tester, credentials);

    await tester.tap(find.text('Continue with Google'));
    await tester.pumpAndSettle();

    expect(credentials.requested, [SocialAuthProvider.google]);
    expect(
      repository.socialLoginCalls.single.provider,
      SocialAuthProvider.google,
    );
    expect(
      repository.socialLoginCalls.single.accessToken,
      'provider-token-123',
    );
    expect(storage.token, 'social-token');
    expect(find.byType(discovery_feed.DiscoveryScreen), findsOneWidget);
  });

  testWidgets('providers the platform does not support are not shown', (
    tester,
  ) async {
    await pumpLogin(
      tester,
      FakeSocialCredentialProvider(supported: {SocialAuthProvider.google}),
    );

    expect(find.text('Continue with Google'), findsOneWidget);
    expect(find.text('Continue with Apple'), findsNothing);
  });

  testWidgets('a dismissed sheet stays on login with no error', (tester) async {
    await pumpLogin(tester, FakeSocialCredentialProvider(token: null));

    await tester.tap(find.text('Continue with Apple'));
    await tester.pumpAndSettle();

    expect(find.byType(LoginScreen), findsOneWidget);
    expect(repository.socialLoginCalls, isEmpty);
    expect(find.text('Sign-in failed. Please try again.'), findsNothing);
  });

  testWidgets('an SDK failure shows the failure banner', (tester) async {
    await pumpLogin(
      tester,
      FakeSocialCredentialProvider(error: StateError('sdk')),
    );

    await tester.tap(find.text('Continue with Google'));
    await tester.pumpAndSettle();

    expect(find.text('Sign-in failed. Please try again.'), findsOneWidget);
    expect(storage.token, isNull);
  });

  testWidgets('a rejected backend exchange keeps the user on login', (
    tester,
  ) async {
    repository.socialLoginError = unauthorized();
    await pumpLogin(tester, FakeSocialCredentialProvider());

    await tester.tap(find.text('Continue with Google'));
    await tester.pumpAndSettle();

    expect(find.byType(LoginScreen), findsOneWidget);
    expect(storage.token, isNull);
  });
}
