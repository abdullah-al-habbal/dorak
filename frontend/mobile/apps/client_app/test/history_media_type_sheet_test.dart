import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/profile/history_media_type.entity.dart';
import 'package:client_app/src/features/profile/widgets/history_media_type_sheet.widget.dart';

void main() {
  Future<void> openSheet(WidgetTester tester, List<String?> results) async {
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: Builder(
          builder: (context) => TextButton(
            onPressed: () async =>
                results.add(await HistoryMediaTypeSheet.show(context)),
            child: const Text('open'),
          ),
        ),
      ),
    );
    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();
  }

  testWidgets('defaults to the after photo type', (tester) async {
    final results = <String?>[];
    await openSheet(tester, results);

    await tester.tap(find.text('Continue'));
    await tester.pumpAndSettle();

    expect(results, [HistoryMediaType.after]);
  });

  testWidgets('returns the type the client selects', (tester) async {
    final results = <String?>[];
    await openSheet(tester, results);

    await tester.tap(find.text('Reference'));
    await tester.pump();
    await tester.tap(find.text('Continue'));
    await tester.pumpAndSettle();

    expect(results, [HistoryMediaType.reference]);
  });

  testWidgets('offers before, after and reference', (tester) async {
    await openSheet(tester, []);

    expect(find.text('Before'), findsOneWidget);
    expect(find.text('After'), findsOneWidget);
    expect(find.text('Reference'), findsOneWidget);
  });

  testWidgets('dismissing the sheet returns no type', (tester) async {
    final results = <String?>[];
    await openSheet(tester, results);

    await tester.tapAt(const Offset(10, 10));
    await tester.pumpAndSettle();

    expect(results, [null]);
  });
}
