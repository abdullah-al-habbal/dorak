import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/support/about_support.screen.dart';
import 'package:client_app/src/features/support/feedback.screen.dart';

class _FakeOpener implements ExternalLinkOpener {
  final opened = <Uri>[];

  @override
  Future<bool> open(Uri uri) async {
    opened.add(uri);
    return true;
  }
}

class _FakeAppInfo implements AppInfoProvider {
  const _FakeAppInfo();

  @override
  Future<String> version() async => '2.0.0+5';
}

class _FakeFeedbackRepository implements FeedbackRepository {
  final sent = <FeedbackReportRequestDto>[];
  Object? error;

  @override
  Future<void> submit(FeedbackReportRequestDto report) async {
    sent.add(report);
    final failure = error;
    if (failure != null) throw failure;
  }
}

Widget _host(Widget home, {Locale? locale}) => MaterialApp(
  locale: locale,
  localizationsDelegates: AppLocalizations.localizationsDelegates,
  supportedLocales: AppLocalizations.supportedLocales,
  home: home,
);

FeedbackBloc _bloc(_FakeFeedbackRepository repository) => FeedbackBloc(
  repository,
  FeedbackApp.client,
  appInfo: const _FakeAppInfo(),
  platformName: () => 'android',
);

void main() {
  testWidgets('About shows the version and opens the Arabic privacy page', (
    tester,
  ) async {
    final opener = _FakeOpener();
    await tester.pumpWidget(
      _host(
        AboutSupportScreen(
          legalLinks: LegalLinks.fromApiBaseUrl('https://dorak.example/api'),
          onFeedback: () {},
          linkOpener: opener,
          appInfo: const _FakeAppInfo(),
        ),
        locale: const Locale('ar'),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byType(ListTile).first);
    await tester.pump();

    expect(opener.opened.single.toString(), 'https://dorak.example/ar/privacy');
  });

  testWidgets(
    'feedback sends the client app context and closes with a notice',
    (tester) async {
      final repository = _FakeFeedbackRepository();
      final bloc = _bloc(repository);
      addTearDown(bloc.close);
      await tester.pumpWidget(
        _host(FeedbackScreen(bloc: bloc, screenKey: 'profile/about')),
      );

      await tester.enterText(find.byType(TextFormField).first, 'Love the app');
      await tester.tap(find.text('Send'));
      await tester.pumpAndSettle();

      final report = repository.sent.single.toJson();
      expect(report['app'], 'client');
      expect(report['app_version'], '2.0.0+5');
      expect(report['screen'], 'profile/about');
    },
  );

  testWidgets(
    'a network failure keeps the form and shows the offline message',
    (tester) async {
      final repository = _FakeFeedbackRepository()
        ..error = const NetworkException(
          type: DioExceptionType.connectionError,
          retryable: true,
          message: 'offline',
        );
      final bloc = _bloc(repository);
      addTearDown(bloc.close);
      await tester.pumpWidget(
        _host(FeedbackScreen(bloc: bloc, screenKey: 'profile/about')),
      );

      await tester.enterText(find.byType(TextFormField).first, 'Love the app');
      await tester.tap(find.text('Send'));
      await tester.pumpAndSettle();

      expect(
        find.text('No connection. Check your network and try again.'),
        findsOneWidget,
      );
    },
  );
}
