import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/core/navigation/app_routes.entity.dart';
import 'package:client_app/src/features/profile/phone_verification.bloc.dart';
import 'package:client_app/src/features/profile/phone_verification.screen.dart';
import 'package:client_app/src/features/profile/profile_completion.bloc.dart';
import 'package:client_app/src/features/profile/profile_completion.screen.dart';

import 'helpers/fakes.dart';

void main() {
  testWidgets('completion saves the name then verifies the phone by OTP', (
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
      phoneVerification: PhoneVerificationBloc(profile, '+963900000000'),
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
    expect(profile.lastName, 'Sara');
    expect(profile.requestOtpCalls, 1);
    expect(profile.lastOtpPhone, '+963900000000');
    expect(find.byType(PhoneVerificationScreen), findsOneWidget);

    await tester.enterText(find.byType(TextField), '123456');
    await tester.tap(find.text('Verify phone'));
    await tester.pumpAndSettle();

    expect(profile.lastOtpCode, '123456');
    expect(find.byType(PhoneVerificationScreen), findsNothing);
    expect(pair.session.state.client?.phoneVerified, isTrue);
    expect(
      router.router.routeInformationProvider.value.uri.path,
      AppRoutes.discover,
    );
  });
}
