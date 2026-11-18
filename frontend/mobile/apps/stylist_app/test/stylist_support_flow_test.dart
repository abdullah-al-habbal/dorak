import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/core/navigation/app.router.dart';
import 'package:stylist_app/src/features/auth/stylist_sign_up.bloc.dart';
import 'package:stylist_app/src/features/operations/stylist.bloc.dart';
import 'package:stylist_app/src/features/support/about_support.screen.dart';
import 'package:stylist_app/src/features/support/delete_account.screen.dart';
import 'package:stylist_app/src/features/support/feedback.screen.dart';

import 'helpers/sign_up_fakes.dart';
import 'helpers/stylist_fakes.dart';

class _FakeOpener implements ExternalLinkOpener {
  final opened = <Uri>[];

  @override
  Future<bool> open(Uri uri) async {
    opened.add(uri);
    return true;
  }
}

void main() {
  late FakeFeedbackRepository feedback;
  late FakeAccountRepository account;
  late int deleted;
  late StylistAppRouter router;

  Future<void> pumpApp(WidgetTester tester) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);
    feedback = FakeFeedbackRepository();
    account = FakeAccountRepository();
    deleted = 0;

    final storage = InMemoryStaffTokenStorage()..token = 'stored-token';
    final staffAuth = FakeStaffAuthRepository();
    final session = StaffSessionBloc(staffAuth, storage);
    addTearDown(session.close);
    final repository = FakeStylistOperationsRepository();
    final operations = StylistBloc(repository);
    addTearDown(operations.close);
    final features = featureBlocsFor(
      repository,
      feedbackRepository: feedback,
      accountRepository: account,
    );
    addTearDown(features.close);
    final signUp = StylistSignUpBloc(FakeBarberRegistrationRepository());
    addTearDown(signUp.close);
    router = StylistAppRouter(
      operations: operations,
      features: features,
      session: session,
      signUp: signUp,
      passwordReset: StaffPasswordResetBloc(staffAuth),
      onLocaleToggle: () {},
      onLogout: () {},
      onAuthenticated: () {},
      onAccountDeleted: () => deleted++,
      legalLinks: LegalLinks.fromApiBaseUrl('https://dorak.example/api'),
    );
    addTearDown(router.dispose);
    await session.restore();
    await tester.pumpWidget(
      MaterialApp.router(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        routerConfig: router.router,
        builder: (context, child) =>
            BlocProvider.value(value: session, child: child!),
      ),
    );
    await tester.pumpAndSettle();
  }

  testWidgets(
    'More lists About and legal, which shows the links and the actions',
    (tester) async {
      await pumpApp(tester);

      router.router.go('/more');
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('About and legal'));
      await tester.tap(find.text('About and legal'));
      await tester.pumpAndSettle();

      expect(find.byType(AboutSupportScreen), findsOneWidget);
      for (final label in [
        'Privacy policy',
        'Terms of service',
        'Contact us',
        'Send feedback',
        'Delete account',
      ]) {
        expect(find.text(label), findsWidgets);
      }
    },
  );

  testWidgets('a legal link opens through the link opener', (tester) async {
    final opener = _FakeOpener();
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: AboutSupportScreen(
          legalLinks: LegalLinks.fromApiBaseUrl('https://dorak.example/api'),
          onFeedback: () {},
          onDeleteAccount: () {},
          linkOpener: opener,
          appInfo: const FakeAppInfo(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Version 1.0.0+1'), findsOneWidget);
    await tester.tap(find.text('Privacy policy'));
    await tester.pump();

    expect(opener.opened.single.toString(), 'https://dorak.example/en/privacy');
  });

  testWidgets('feedback is sent with the stylist app context', (tester) async {
    await pumpApp(tester);
    router.router.go('/home/about/feedback');
    await tester.pumpAndSettle();

    expect(find.byType(FeedbackScreen), findsOneWidget);
    await tester.enterText(
      find.byType(TextFormField).first,
      'Schedule is wrong',
    );
    await tester.tap(find.text('Send'));
    await tester.pumpAndSettle();

    final report = feedback.sent.single.toJson();
    expect(report['app'], 'stylist');
    expect(report['platform'], 'android');
    expect(report['app_version'], '1.0.0+1');
    expect(report['screen'], 'more/about');
    expect(report['message'], 'Schedule is wrong');
    expect(report.containsKey('contact_email'), isFalse);
  });

  testWidgets('a rate-limited feedback keeps the form and explains why', (
    tester,
  ) async {
    await pumpApp(tester);
    feedback.error = const ApiException(
      statusCode: 429,
      code: 'TOO_MANY_REQUESTS',
      message: 'slow',
    );
    router.router.go('/home/about/feedback');
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextFormField).first, 'Again please');
    await tester.tap(find.text('Send'));
    await tester.pumpAndSettle();

    expect(
      find.text('You sent several messages already. Please try again later.'),
      findsOneWidget,
    );
    expect(find.byType(FeedbackScreen), findsOneWidget);
  });

  testWidgets(
    'deleting the account sends the password and signs the stylist out',
    (tester) async {
      await pumpApp(tester);
      router.router.go('/home/about/delete-account');
      await tester.pumpAndSettle();

      expect(find.byType(DeleteAccountScreen), findsOneWidget);
      await tester.enterText(find.byType(TextField), 'password123');
      await tester.tap(find.text('Delete my account'));
      await tester.pumpAndSettle();

      expect(account.passwords, ['password123']);
      expect(deleted, 1);
    },
  );

  testWidgets(
    'an open booking or an active affiliation blocks it with a clear message',
    (tester) async {
      await pumpApp(tester);
      account.error = const ApiException(
        statusCode: 409,
        code: 'ACCOUNT_HAS_ACTIVE_AFFILIATION',
        message: 'blocked',
      );
      router.router.go('/home/about/delete-account');
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField), 'password123');
      await tester.tap(find.text('Delete my account'));
      await tester.pumpAndSettle();

      expect(
        find.text(
          'End your work with your brand or branch first, then delete your account.',
        ),
        findsOneWidget,
      );
      expect(deleted, 0);
    },
  );
}
