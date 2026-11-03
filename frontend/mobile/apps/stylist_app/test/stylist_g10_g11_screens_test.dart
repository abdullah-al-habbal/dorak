import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/core/navigation/app_routes.entity.dart';
import 'package:stylist_app/src/features/appointments/stylist_appointments.bloc.dart';
import 'package:stylist_app/src/features/appointments/stylist_appointments.screen.dart';
import 'package:stylist_app/src/features/earnings/stylist_earnings.bloc.dart';
import 'package:stylist_app/src/features/earnings/stylist_earnings.screen.dart';
import 'package:stylist_app/src/features/inbox/stylist_inbox.bloc.dart';
import 'package:stylist_app/src/features/inbox/stylist_inbox.screen.dart';
import 'package:stylist_app/src/features/more/stylist_more.screen.dart';

import 'helpers/stylist_fakes.dart';

const _usd = EarningsTotalDto(
  currencyCode: 'USD',
  grossMinor: 8000,
  netMinor: 6400,
  completedBookingsCount: 2,
);

Future<void> _pump(WidgetTester tester, Widget home) => tester.pumpWidget(
  MaterialApp(
    localizationsDelegates: AppLocalizations.localizationsDelegates,
    supportedLocales: AppLocalizations.supportedLocales,
    home: home,
  ),
);

void main() {
  group('StylistEarningsScreen', () {
    testWidgets('shows gross and net per currency', (tester) async {
      final repo = FakeEarningsRepository()
        ..earnings = const EarningsDto(scope: 'barber', totals: [_usd]);
      final bloc = StylistEarningsBloc(repo);
      addTearDown(bloc.close);

      await _pump(tester, StylistEarningsScreen(bloc: bloc));
      await tester.pumpAndSettle();

      expect(find.text('Gross: 80.00 USD'), findsOneWidget);
      expect(find.text('Net: 64.00 USD'), findsOneWidget);
    });

    testWidgets('shows "not available" when the net is unknown', (
      tester,
    ) async {
      final repo = FakeEarningsRepository()
        ..earnings = const EarningsDto(
          scope: 'barber',
          totals: [EarningsTotalDto(currencyCode: 'USD', grossMinor: 1000)],
        );
      final bloc = StylistEarningsBloc(repo);
      addTearDown(bloc.close);

      await _pump(tester, StylistEarningsScreen(bloc: bloc));
      await tester.pumpAndSettle();

      expect(find.text('Net: Not available'), findsOneWidget);
    });

    testWidgets('all-time chip reloads without a date range', (tester) async {
      final repo = FakeEarningsRepository();
      final bloc = StylistEarningsBloc(repo);
      addTearDown(bloc.close);

      await _pump(tester, StylistEarningsScreen(bloc: bloc));
      await tester.pumpAndSettle();
      await tester.tap(find.text('All time'));
      await tester.pumpAndSettle();

      expect(repo.fromRequests, hasLength(2));
      expect(repo.fromRequests.last, isNull);
    });
  });

  group('StylistInboxScreen', () {
    testWidgets('lists notifications and marks the tapped one read', (
      tester,
    ) async {
      final repo = FakeNotificationRepository()
        ..items = [
          const NotificationDto(
            id: 'n1',
            type: 'booking_created',
            title: 'New booking',
            body: 'Body',
          ),
        ];
      final bloc = StylistInboxBloc(repo);
      addTearDown(bloc.close);

      await _pump(tester, StylistInboxScreen(bloc: bloc, onOpen: (_) {}));
      await tester.pumpAndSettle();
      await tester.tap(find.text('New booking'));

      expect(repo.read, ['n1']);
    });
  });

  group('StylistAppointmentsScreen', () {
    testWidgets('selecting a status chip filters the history', (tester) async {
      final repo = FakeStylistAppointmentRepository();
      final bloc = StylistAppointmentsBloc(repo);
      addTearDown(bloc.close);

      await _pump(tester, StylistAppointmentsScreen(bloc: bloc));
      await tester.pumpAndSettle();
      expect(repo.requestedStatuses, [null]);

      await tester.tap(find.byType(ChoiceChip).at(1));
      await tester.pumpAndSettle();

      expect(repo.requestedStatuses.last, BookingStatus.completed);
    });
  });

  group('StylistMoreScreen', () {
    testWidgets('services entry navigates to the services route', (
      tester,
    ) async {
      String? opened;
      await _pump(
        tester,
        StylistMoreScreen(
          onNavigate: (route) => opened = route,
          onLocaleToggle: () {},
          onLogout: () {},
        ),
      );

      await tester.tap(find.text('Services and pricing'));
      expect(opened, AppRoutes.services);
    });
  });
}
