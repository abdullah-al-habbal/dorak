import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/core/navigation/app_routes.entity.dart';
import 'package:client_app/src/features/profile/profile_completion.bloc.dart';
import 'package:client_app/src/features/profile/profile_completion.screen.dart';

import 'helpers/fakes.dart';

void main() {
  testWidgets('completion saves the supported fields and enters Discover', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);
    final preferences = InMemoryAppPreferences(profileCompleted: false);
    final profile = FakeProfileRepository();
    final pair = sessionPair(
      FakeAuthRepository(),
      InMemoryTokenStorage('stored-token'),
    );
    final router = buildRouter(
      session: pair.session,
      auth: pair.auth,
      preferences: preferences,
      profileCompletion: ProfileCompletionBloc(profile, preferences),
      apiClient: fakeApiClient(),
    );
    addTearDown(pair.coordinator.cancel);

    await tester.pumpWidget(routerHarness(router));
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pump(const Duration(seconds: 3));
    await tester.pumpAndSettle();

    expect(find.byType(ProfileCompletionScreen), findsOneWidget);
    await tester.enterText(find.byType(TextFormField).first, 'Sara');
    await tester.enterText(find.byType(TextFormField).at(1), '+963900000000');
    await tester.tap(find.text('Save & Continue'));
    await tester.pumpAndSettle();

    expect(preferences.profileCompleted, isTrue);
    expect(profile.lastPhone, '+963900000000');
    expect(
      router.router.routeInformationProvider.value.uri.path,
      AppRoutes.discover,
    );
  });
}
