import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/core/navigation/app_routes.entity.dart';
import 'package:client_app/src/features/auth/auth_entry.screen.dart';
import 'package:client_app/src/features/profile/delete_account.screen.dart';

import 'helpers/fakes.dart';

void main() {
  testWidgets('deleting the account clears the session and opens auth entry', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);

    final repository = FakeAuthRepository();
    final storage = InMemoryTokenStorage('stored-token');
    final pair = sessionPair(repository, storage);
    addTearDown(pair.coordinator.cancel);
    final router = buildRouter(
      session: pair.session,
      auth: pair.auth,
      preferences: InMemoryAppPreferences(dontShowOnboarding: true),
      apiClient: fakeApiClient(),
      recoveryRepository: repository,
    );
    await tester.pumpWidget(routerHarness(router));
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pump(const Duration(seconds: 3));
    await tester.pumpAndSettle();

    router.router.go(AppRoutes.profileDelete);
    await tester.pumpAndSettle();
    expect(find.byType(DeleteAccountScreen), findsOneWidget);

    await tester.enterText(find.byType(TextField), 'secret123');
    await tester.tap(find.text('Delete my account'));
    await tester.pumpAndSettle();

    expect(repository.lastDeletePassword, 'secret123');
    expect(find.byType(AuthEntryScreen), findsOneWidget);
    expect(storage.token, isNull);
  });
}
