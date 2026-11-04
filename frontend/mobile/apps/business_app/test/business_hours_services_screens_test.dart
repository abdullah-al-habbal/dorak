import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/hours/business_hours.bloc.dart';
import 'package:business_app/src/features/hours/business_hours.screen.dart';
import 'package:business_app/src/features/services/business_service_form.screen.dart';
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
      bloc = BusinessServicesBloc(repository, FakeBranchHoursRepository());
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
        home: BusinessServicesScreen(bloc: bloc, onAdd: () {}, onEdit: (_) {}),
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
        home: BusinessServicesScreen(bloc: bloc, onAdd: () {}, onEdit: (_) {}),
      );

      expect(find.text('No services yet. Add your first one.'), findsOneWidget);
    });

    testWidgets('a load failure replaces the empty state with the error', (
      tester,
    ) async {
      repository.failure = StateError('offline');
      await _pumpRouter(
        tester,
        home: BusinessServicesScreen(bloc: bloc, onAdd: () {}, onEdit: (_) {}),
      );

      expect(find.text('No services yet. Add your first one.'), findsNothing);
      expect(find.text('Could not load. Pull to retry.'), findsOneWidget);
    });

    testWidgets('add and row taps are forwarded to the callbacks', (
      tester,
    ) async {
      repository.services = [_service()];
      var added = 0;
      String? edited;
      await _pumpRouter(
        tester,
        home: BusinessServicesScreen(
          bloc: bloc,
          onAdd: () => added++,
          onEdit: (id) => edited = id,
        ),
      );

      await tester.tap(find.text('Add service'));
      await tester.tap(find.text('Haircut'));

      expect(added, 1);
      expect(edited, 'svc-1');
    });
  });

  group('BusinessServiceFormScreen', () {
    late FakeBranchServiceRepository repository;
    late FakeBranchHoursRepository branch;
    late BusinessServicesBloc bloc;

    setUp(() {
      repository = FakeBranchServiceRepository();
      branch = FakeBranchHoursRepository();
      bloc = BusinessServicesBloc(repository, branch);
      addTearDown(bloc.close);
    });

    Future<void> openForm(WidgetTester tester, {String? serviceId}) async {
      await _pumpRouter(
        tester,
        home: Builder(
          builder: (context) => Scaffold(
            body: TextButton(
              onPressed: () => context.push(_formRoute),
              child: const Text('open'),
            ),
          ),
        ),
        form: BusinessServiceFormScreen(bloc: bloc, serviceId: serviceId),
      );
      await tester.tap(find.text('open'));
      await tester.pumpAndSettle();
    }

    Finder field(String label) => find.widgetWithText(TextFormField, label);

    testWidgets('an empty submit shows validation errors and saves nothing', (
      tester,
    ) async {
      await openForm(tester);

      await tester.tap(find.text('Save service'));
      await tester.pumpAndSettle();

      expect(find.text('This field is required.'), findsNWidgets(3));
      expect(repository.createdName, isNull);
    });

    testWidgets('a non-numeric price is rejected', (tester) async {
      await openForm(tester);
      await tester.enterText(field('Name (English)'), 'Cut');
      await tester.enterText(field('Name (Arabic)'), 'قص');
      await tester.enterText(field('Price'), 'abc');

      await tester.tap(find.text('Save service'));
      await tester.pumpAndSettle();

      expect(find.text('Enter a valid number.'), findsOneWidget);
      expect(repository.createdName, isNull);
    });

    testWidgets('a valid form creates the service and returns to the list', (
      tester,
    ) async {
      await openForm(tester);
      await tester.enterText(field('Name (English)'), 'Cut');
      await tester.enterText(field('Name (Arabic)'), 'قص');
      await tester.enterText(field('Price'), '12.5');

      await tester.tap(find.text('Save service'));
      await tester.pumpAndSettle();

      expect(repository.createdBrandId, 'brand-1');
      expect(repository.createdName, {'en': 'Cut', 'ar': 'قص'});
      expect(find.text('New service'), findsNothing);
      expect(find.text('open'), findsOneWidget);
    });

    testWidgets('a rejected save stays on the form with the error', (
      tester,
    ) async {
      repository.failure = StateError('rejected');
      await openForm(tester);
      await tester.enterText(field('Name (English)'), 'Cut');
      await tester.enterText(field('Name (Arabic)'), 'قص');
      await tester.enterText(field('Price'), '12.5');

      await tester.tap(find.text('Save service'));
      await tester.pumpAndSettle();

      expect(find.text('New service'), findsOneWidget);
    });

    testWidgets('edit mode prefills the stored service and updates it', (
      tester,
    ) async {
      repository.services = [_service()];
      await bloc.load();
      await openForm(tester, serviceId: 'svc-1');

      expect(find.text('Edit service'), findsOneWidget);
      expect(
        tester.widget<TextFormField>(field('Name (English)')).controller!.text,
        'Haircut',
      );

      await tester.enterText(field('Name (Arabic)'), 'قص');
      await tester.tap(find.text('Save service'));
      await tester.pumpAndSettle();

      expect(repository.updatedId, 'svc-1');
    });

    testWidgets('delete asks for confirmation before removing', (tester) async {
      repository.services = [_service()];
      await bloc.load();
      await openForm(tester, serviceId: 'svc-1');

      await tester.tap(find.byTooltip('Delete'));
      await tester.pumpAndSettle();
      expect(find.text('Delete this service?'), findsOneWidget);

      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();
      expect(repository.deletedId, isNull);

      await tester.tap(find.byTooltip('Delete'));
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(TextButton, 'Delete'));
      await tester.pumpAndSettle();

      expect(repository.deletedId, 'svc-1');
      expect(find.text('open'), findsOneWidget);
    });

    testWidgets('create mode has no delete action', (tester) async {
      await openForm(tester);

      expect(find.byTooltip('Delete'), findsNothing);
    });
  });
}
