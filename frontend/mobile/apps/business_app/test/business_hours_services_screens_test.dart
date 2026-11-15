import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/hours/business_hours.bloc.dart';
import 'package:business_app/src/features/hours/business_hours.screen.dart';
import 'package:business_app/src/features/services/business_services.bloc.dart';
import 'package:business_app/src/features/services/business_services.screen.dart';

import 'helpers/business_fakes.dart';

const _formRoute = '/form';

BusinessServiceDto _service({
  String id = 'svc-1',
  String name = 'Haircut',
  double price = 12.5,
  int? minutes = 30,
  bool isActive = true,
}) => BusinessServiceDto(
  id: id,
  serviceableId: 'brand-1',
  name: name,
  priceAmountMinor: MinorUnits.fromMajor(price),
  currencyCode: 'USD',
  durationMinutes: minutes,
  isActive: isActive,
);

Future<void> _pumpRouter(
  WidgetTester tester, {
  required Widget home,
  Widget? form,
}) async {
  tester.view.devicePixelRatio = 1.0;
  tester.view.physicalSize = const Size(800, 1600);
  addTearDown(tester.view.reset);
  final router = GoRouter(
    routes: [
      GoRoute(path: '/', builder: (context, state) => home),
      GoRoute(path: _formRoute, builder: (context, state) => form ?? home),
    ],
  );
  addTearDown(router.dispose);
  await tester.pumpWidget(
    MaterialApp.router(
      routerConfig: router,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  group('BusinessHoursScreen', () {
    late FakeBranchHoursRepository repository;
    late BusinessHoursBloc bloc;

    setUp(() {
      repository = FakeBranchHoursRepository();
      bloc = BusinessHoursBloc(repository);
      addTearDown(bloc.close);
    });

    testWidgets('renders all seven days, closed by default', (tester) async {
      await _pumpRouter(tester, home: BusinessHoursScreen(bloc: bloc));

      expect(find.text('Working hours'), findsOneWidget);
      expect(find.byType(SwitchListTile), findsNWidgets(7));
      expect(find.text('Closed'), findsNWidgets(7));
    });

    testWidgets('opening a day reveals its times and Save persists the week', (
      tester,
    ) async {
      await _pumpRouter(tester, home: BusinessHoursScreen(bloc: bloc));

      await tester.tap(find.byType(SwitchListTile).at(1));
      await tester.pumpAndSettle();
      expect(find.text('Closed'), findsNWidgets(6));

      await tester.tap(find.text('Save'));
      await tester.pumpAndSettle();

      expect(repository.saved, hasLength(7));
      expect(repository.saved![1].isClosed, isFalse);
      expect(find.text('Saved'), findsOneWidget);
    });

    testWidgets('a load failure shows the error and no day rows', (
      tester,
    ) async {
      repository.failure = StateError('offline');
      await _pumpRouter(tester, home: BusinessHoursScreen(bloc: bloc));

      expect(find.byType(SwitchListTile), findsNothing);
      expect(find.byType(FilledButton), findsOneWidget);
    });

    testWidgets('a rejected save keeps the form and shows the error', (
      tester,
    ) async {
      await _pumpRouter(tester, home: BusinessHoursScreen(bloc: bloc));
      repository.failure = StateError('rejected');

      await tester.tap(find.text('Save'));
      await tester.pumpAndSettle();

      expect(find.text('Saved'), findsNothing);
      expect(find.byType(SwitchListTile), findsNWidgets(7));
    });
  });

  group('BusinessServicesScreen', () {
    late FakeBranchServiceRepository repository;
    late BusinessServicesBloc bloc;

    setUp(() {
      repository = FakeBranchServiceRepository();
      bloc = BusinessServicesBloc(repository);
      addTearDown(bloc.close);
    });

    testWidgets('lists services with price, duration and status', (
      tester,
    ) async {
      repository.services = [
        _service(),
        _service(id: 'svc-2', name: 'Shave', minutes: null, isActive: false),
      ];
      await _pumpRouter(
        tester,
        home: BusinessServicesScreen(bloc: bloc),
      );

      expect(find.text('Haircut'), findsOneWidget);
      expect(find.text('12.50 USD · 30 min · Active'), findsOneWidget);
      expect(find.text('Shave'), findsOneWidget);
      expect(find.text('12.50 USD · Inactive'), findsOneWidget);
    });

    testWidgets('shows the empty state when there are no services', (
      tester,
    ) async {
      await _pumpRouter(
        tester,
        home: BusinessServicesScreen(bloc: bloc),
      );

      expect(find.text('No services yet. The brand owner adds them.'), findsOneWidget);
    });

    testWidgets('a load failure replaces the empty state with the error', (
      tester,
    ) async {
      repository.failure = StateError('offline');
      await _pumpRouter(
        tester,
        home: BusinessServicesScreen(bloc: bloc),
      );

      expect(find.text('No services yet. The brand owner adds them.'), findsNothing);
      expect(find.text('Could not load. Pull to retry.'), findsOneWidget);
    });

    testWidgets('offers no add button and no edit tap (F-07)', (tester) async {
      repository.services = [_service()];
      await _pumpRouter(tester, home: BusinessServicesScreen(bloc: bloc));

      expect(find.text('Add service'), findsNothing);
      expect(find.byType(FloatingActionButton), findsNothing);
      expect(find.byIcon(Icons.chevron_right), findsNothing);
    });
  });
}
