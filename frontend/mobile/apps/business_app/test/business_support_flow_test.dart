import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/support/about_support.screen.dart';
import 'package:business_app/src/features/support/feedback.screen.dart';

import 'helpers/business_fakes.dart';

class _FakeOpener implements ExternalLinkOpener {
  final opened = <Uri>[];

  @override
  Future<bool> open(Uri uri) async {
    opened.add(uri);
    return true;
  }
}

Widget _host(Widget home) => MaterialApp(
  localizationsDelegates: AppLocalizations.localizationsDelegates,
  supportedLocales: AppLocalizations.supportedLocales,
  home: home,
);

void main() {
  testWidgets('About shows the version and opens a legal link', (tester) async {
    final opener = _FakeOpener();
    await tester.pumpWidget(
      _host(
        AboutSupportScreen(
          legalLinks: LegalLinks.fromApiBaseUrl('https://dorak.example/api'),
          onFeedback: () {},
          linkOpener: opener,
          appInfo: const FakeAppInfo(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Version 1.0.0+1'), findsOneWidget);
    expect(find.text('Delete account'), findsNothing);
    await tester.tap(find.text('Terms of service'));
    await tester.pump();

    expect(opener.opened.single.toString(), 'https://dorak.example/en/terms');
  });

  testWidgets('feedback is sent with the business app context', (tester) async {
    final repository = FakeFeedbackRepository();
    final bloc = FeedbackBloc(
      repository,
      FeedbackApp.business,
      appInfo: const FakeAppInfo(),
      platformName: () => 'ios',
    );
    addTearDown(bloc.close);
    await tester.pumpWidget(
      _host(FeedbackScreen(bloc: bloc, screenKey: 'more/about')),
    );

    await tester.enterText(find.byType(TextFormField).first, 'Hours are wrong');
    await tester.tap(find.text('Send'));
    await tester.pumpAndSettle();

    final report = repository.sent.single.toJson();
    expect(report['app'], 'business');
    expect(report['platform'], 'ios');
    expect(report['screen'], 'more/about');
  });
}
