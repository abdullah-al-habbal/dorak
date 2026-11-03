import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/history/stylist_client_history.bloc.dart';
import 'package:stylist_app/src/features/history/stylist_client_history.screen.dart';
import 'package:stylist_app/src/features/operations/widgets/appointment_card.widget.dart';

import 'helpers/stylist_fakes.dart';

void main() {
  testWidgets('a stylist tags and uploads a photo on their own visit', (
    tester,
  ) async {
    final history = FakeBarberHistoryRepository();
    final bloc = StylistClientHistoryBloc(
      history,
      FakePhotoPicker(),
      () => 'barber-1',
    );
    addTearDown(bloc.close);
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: StylistClientHistoryScreen(bloc: bloc, clientId: 'client-1'),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Classic Fade'), findsNWidgets(2));
    expect(find.text('Add photo'), findsOneWidget);

    await tester.tap(find.text('Add photo'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Before'));
    await tester.tap(find.text('Continue'));
    await tester.pumpAndSettle();

    expect(history.attachedHistoryId, 'h1');
    expect(history.attachedType, 'before');
    expect(find.text('Photo added.'), findsOneWidget);
  });

  testWidgets('only completed appointments with a client offer the history', (
    tester,
  ) async {
    var opened = 0;
    Future<void> pumpCard(BookingDto booking) => tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: Builder(
          builder: (context) => Scaffold(
            body: AppointmentCard(
              booking: booking,
              isUpdating: false,
              onAction: (_) {},
              onCancel: () {},
              onViewHistory: () => opened++,
              l10n: AppLocalizations.of(context)!,
            ),
          ),
        ),
      ),
    );
    const client = BookingClientDto(id: 'client-1');
    BookingDto booking(BookingStatus status, {BookingClientDto? who}) =>
        BookingDto(
          id: 'b1',
          startsAt: DateTime.utc(2026, 10, 29, 10),
          status: status,
          client: who,
        );

    await pumpCard(booking(BookingStatus.completed, who: client));
    await tester.tap(find.text('Visit history'));
    expect(opened, 1);

    await pumpCard(booking(BookingStatus.confirmed, who: client));
    expect(find.text('Visit history'), findsNothing);

    await pumpCard(booking(BookingStatus.completed));
    expect(find.text('Visit history'), findsNothing);
  });
}
