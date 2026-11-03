import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/core/navigation/app_routes.entity.dart';
import 'package:business_app/src/features/earnings/business_earnings.bloc.dart';
import 'package:business_app/src/features/earnings/business_earnings.screen.dart';
import 'package:business_app/src/features/inbox/business_inbox.bloc.dart';
import 'package:business_app/src/features/inbox/business_inbox.screen.dart';
import 'package:business_app/src/features/more/business_more.screen.dart';
import 'package:business_app/src/features/staff/business_staff.bloc.dart';
import 'package:business_app/src/features/staff/business_staff.screen.dart';

import 'helpers/business_fakes.dart';

const _usd = EarningsTotalDto(
  currencyCode: 'USD',
  grossMinor: 12500,
  commissionMinor: 2500,
  netMinor: 10000,
  completedBookingsCount: 4,
);

Future<void> _pump(WidgetTester tester, Widget home) => tester.pumpWidget(
  MaterialApp(
    localizationsDelegates: AppLocalizations.localizationsDelegates,
    supportedLocales: AppLocalizations.supportedLocales,
    home: home,
  ),
);

void main() {
  group('BusinessEarningsScreen', () {
    testWidgets('shows per-currency gross, commission and net', (tester) async {
      final repo = FakeEarningsRepository()
        ..earnings = const EarningsDto(scope: 'branch', totals: [_usd]);
      final bloc = BusinessEarningsBloc(repo);
      addTearDown(bloc.close);

      await _pump(tester, BusinessEarningsScreen(bloc: bloc));
      await tester.pumpAndSettle();

      expect(find.text('Gross: 125.00 USD'), findsOneWidget);
      expect(find.text('Commission: 25.00 USD'), findsOneWidget);
      expect(find.text('Net: 100.00 USD'), findsOneWidget);
      expect(repo.calls.single.from, isNotNull);
    });

    testWidgets('shows the empty state when nothing was completed', (
      tester,
    ) async {
      final bloc = BusinessEarningsBloc(FakeEarningsRepository());
      addTearDown(bloc.close);

      await _pump(tester, BusinessEarningsScreen(bloc: bloc));
      await tester.pumpAndSettle();

      expect(
        find.text('No completed bookings in this period.'),
        findsOneWidget,
      );
    });

    testWidgets('all-time chip reloads without a date range', (tester) async {
      final repo = FakeEarningsRepository();
      final bloc = BusinessEarningsBloc(repo);
      addTearDown(bloc.close);

      await _pump(tester, BusinessEarningsScreen(bloc: bloc));
      await tester.pumpAndSettle();
      await tester.tap(find.text('All time'));
      await tester.pumpAndSettle();

      expect(repo.calls, hasLength(2));
      expect(repo.calls.last.from, isNull);
      expect(repo.calls.last.to, isNull);
    });

    testWidgets('renders an error instead of totals when loading fails', (
      tester,
    ) async {
      final repo = FakeEarningsRepository()..failure = Exception('boom');
      final bloc = BusinessEarningsBloc(repo);
      addTearDown(bloc.close);

      await _pump(tester, BusinessEarningsScreen(bloc: bloc));
      await tester.pumpAndSettle();

      expect(bloc.state.error, isNotNull);
      expect(find.text('No completed bookings in this period.'), findsNothing);
    });
  });

  group('BusinessMoreScreen', () {
    testWidgets('earnings entry navigates to the earnings route', (
      tester,
    ) async {
      String? opened;
      await _pump(
        tester,
        BusinessMoreScreen(
          onNavigate: (route) => opened = route,
          onAddBarber: () {},
          onLocaleToggle: () {},
          onLogout: () {},
        ),
      );

      await tester.tap(find.text('Earnings'));
      expect(opened, AppRoutes.earnings);
    });
  });

  group('BusinessInboxScreen', () {
    testWidgets('lists notifications and opens the tapped one', (tester) async {
      final repo = FakeNotificationRepository()
        ..items = [
          const NotificationDto(
            id: 'n1',
            type: 'booking_created',
            title: 'New booking',
            body: 'Body',
          ),
        ];
      final bloc = BusinessInboxBloc(repo);
      addTearDown(bloc.close);
      String? opened;

      await _pump(
        tester,
        BusinessInboxScreen(bloc: bloc, onOpen: (id) => opened = id),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('New booking'));

      expect(find.text('New booking'), findsOneWidget);
      expect(repo.read, ['n1']);
      expect(opened, isNull);
    });
  });

  group('BusinessStaffScreen', () {
    testWidgets('lists branch staff members', (tester) async {
      final bloc = BusinessStaffBloc(
        FakeBranchStaffRepository(
          staff: const [
            StaffMemberDto(
              id: 'a',
              name: 'Karim',
              status: BarberStatus.enabled,
            ),
          ],
        ),
        FakeActivationRepository(),
      );
      addTearDown(bloc.close);

      await _pump(tester, BusinessStaffScreen(bloc: bloc));
      await tester.pumpAndSettle();

      expect(find.text('Karim'), findsOneWidget);
    });
  });
}
