import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/services/stylist_service_form.screen.dart';
import 'package:stylist_app/src/features/services/stylist_services.bloc.dart';
import 'package:stylist_app/src/features/services/stylist_services.screen.dart';

import 'helpers/stylist_fakes.dart';

const _formRoute = '/form';

BarberServiceDto _service({
  String id = 'svc-1',
  String name = 'Haircut',
  double price = 12.5,
  int? minutes = 30,
  bool isActive = true,
}) => BarberServiceDto(
  id: id,
  name: name,
  priceAmountMinor: MinorUnits.fromMajor(price),
  currencyCode: 'USD',
  durationMinutes: minutes,
  active: isActive,
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
  group('StylistServicesScreen', () {
    late FakeStylistOperationsRepository repository;
    late StylistServicesBloc bloc;

    setUp(() {
      repository = FakeStylistOperationsRepository();
      bloc = StylistServicesBloc(repository);
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
        home: StylistServicesScreen(bloc: bloc, onAdd: () {}, onEdit: (_) {}),
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
        home: StylistServicesScreen(bloc: bloc, onAdd: () {}, onEdit: (_) {}),
      );

      expect(
        find.text('You have no services yet. Add your first one.'),
        findsOneWidget,
      );
    });

    testWidgets('a load failure replaces the empty state with the error', (
      tester,
    ) async {
      repository.serviceFailure = StateError('offline');
      await _pumpRouter(
        tester,
        home: StylistServicesScreen(bloc: bloc, onAdd: () {}, onEdit: (_) {}),
      );

      expect(
        find.text('You have no services yet. Add your first one.'),
        findsNothing,
      );
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
        home: StylistServicesScreen(
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

  group('StylistServiceFormScreen', () {
    late FakeStylistOperationsRepository repository;
    late StylistServicesBloc bloc;

    setUp(() {
      repository = FakeStylistOperationsRepository();
      bloc = StylistServicesBloc(repository);
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
        form: StylistServiceFormScreen(bloc: bloc, serviceId: serviceId),
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
      expect(repository.createdServiceName, isNull);
    });

    testWidgets('a non-numeric price is rejected', (tester) async {
      await openForm(tester);
      await tester.enterText(field('Name (English)'), 'Cut');
      await tester.enterText(field('Name (Arabic)'), 'قص');
      await tester.enterText(field('Price'), 'abc');

      await tester.tap(find.text('Save service'));
      await tester.pumpAndSettle();

      expect(find.text('Enter a valid number.'), findsOneWidget);
      expect(repository.createdServiceName, isNull);
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

      expect(repository.createdServiceName, {'en': 'Cut', 'ar': 'قص'});
      expect(find.text('New service'), findsNothing);
      expect(find.text('open'), findsOneWidget);
    });

    testWidgets('a rejected save stays on the form with the error', (
      tester,
    ) async {
      repository.serviceFailure = StateError('rejected');
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

      expect(repository.updatedServiceId, 'svc-1');
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
      expect(repository.deletedServiceId, isNull);

      await tester.tap(find.byTooltip('Delete'));
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(TextButton, 'Delete'));
      await tester.pumpAndSettle();

      expect(repository.deletedServiceId, 'svc-1');
      expect(find.text('open'), findsOneWidget);
    });

    testWidgets('create mode has no delete action', (tester) async {
      await openForm(tester);

      expect(find.byTooltip('Delete'), findsNothing);
    });
  });
}
