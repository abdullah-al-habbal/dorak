import 'package:business_app/src/features/operations/booking_status_menu.widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

void main() {
  testWidgets('confirmed booking menu shows only allowed targets', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: Scaffold(
          body: BookingStatusMenu(
            currentStatus: 'confirmed',
            onSelected: (_) {},
          ),
        ),
      ),
    );

    await tester.tap(find.byType(PopupMenuButton<String>));
    await tester.pumpAndSettle();

    expect(find.text('Start'), findsOneWidget);
    expect(find.text('No-show'), findsOneWidget);
    expect(find.text('Cancel'), findsOneWidget);
    expect(find.text('Complete'), findsNothing);
    expect(find.text('Confirm'), findsNothing);
  });
}
