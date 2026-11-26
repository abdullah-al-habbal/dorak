import 'package:core/core.dart';
import 'package:feature_error_feedback/feature_error_feedback.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

class _Opener implements ExternalLinkOpener {
  _Opener(this.opens);

  final bool opens;

  @override
  Future<bool> open(Uri uri) async => opens;
}

Widget _app(Widget child, {Locale locale = const Locale('en')}) => MaterialApp(
  locale: locale,
  localizationsDelegates: AppLocalizations.localizationsDelegates,
  supportedLocales: AppLocalizations.supportedLocales,
  home: Scaffold(body: child),
);

const _failure = ApiException(statusCode: 500, code: 'X', message: 'raw');

void main() {
  testWidgets('an inline error shows the mapped message', (tester) async {
    await tester.pumpWidget(
      _app(const InlineError(error: _failure, fallbackMessage: 'Not saved')),
    );

    expect(find.text('Not saved'), findsOneWidget);
    expect(find.text('raw'), findsNothing);
  });

  testWidgets('an app message replaces the mapped one, in Arabic too', (
    tester,
  ) async {
    await tester.pumpWidget(
      _app(
        const InlineError(error: _failure, message: 'غير متاح'),
        locale: const Locale('ar'),
      ),
    );

    expect(find.text('غير متاح'), findsOneWidget);
    expect(
      Directionality.of(tester.element(find.byType(InlineError))),
      TextDirection.rtl,
    );
  });

  for (final opens in [true, false]) {
    testWidgets('a link that ${opens ? 'opens' : 'fails'} is reported only '
        'on failure', (tester) async {
      await tester.pumpWidget(
        _app(
          Builder(
            builder: (context) => TextButton(
              onPressed: () => ExternalLinkFeedback.open(
                context,
                _Opener(opens),
                Uri.parse('https://example.test'),
              ),
              child: const Text('open'),
            ),
          ),
        ),
      );

      await tester.tap(find.text('open'));
      await tester.pump();

      expect(find.byType(SnackBar), opens ? findsNothing : findsOneWidget);
    });
  }
}
