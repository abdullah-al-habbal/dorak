import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/core/navigation/app_routes.entity.dart';
import 'package:client_app/src/features/booking/branch_detail.screen.dart';
import 'package:client_app/src/features/stylist/stylist_profile.bloc.dart';

import 'helpers/fakes.dart';

void main() {
  late FakeAuthRepository authRepository;
  late FakeExploreRepository exploreRepository;
  late FakeCurrencyRepository currencyRepository;
  late InMemoryTokenStorage storage;

  setUp(() {
    authRepository = FakeAuthRepository();
    exploreRepository = FakeExploreRepository();
    currencyRepository = FakeCurrencyRepository();
    storage = InMemoryTokenStorage('stored-token');
  });

  Future<void> loadBarberProfile(
    WidgetTester tester, {
    required StylistProfileBloc bloc,
  }) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);

    final pair = sessionPair(authRepository, storage);
    addTearDown(pair.coordinator.cancel);
    addTearDown(bloc.close);

    final router = buildRouter(
      session: pair.session,
      auth: pair.auth,
      stylistProfile: bloc,
      preferences: InMemoryAppPreferences(dontShowOnboarding: true),
      apiClient: fakeApiClient(),
    );
    await tester.pumpWidget(routerHarness(router));
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pump(const Duration(seconds: 3));
    await tester.pumpAndSettle();
    router.router.go(AppRoutes.barberDetail('barber-1'));
    await tester.pumpAndSettle();
  }

  group('stylist profile booking', () {
    testWidgets('Book opens the branch booking route for the barber', (
      tester,
    ) async {
      final bloc = StylistProfileBloc(exploreRepository, currencyRepository);
      await loadBarberProfile(tester, bloc: bloc);

      final book = find.widgetWithText(ElevatedButton, 'Book');
      expect(tester.widget<ElevatedButton>(book).onPressed, isNull);

      await tester.tap(find.byType(Checkbox).first);
      await tester.pumpAndSettle();
      expect(tester.widget<ElevatedButton>(book).onPressed, isNotNull);

      await tester.ensureVisible(book);
      await tester.tap(book);
      await tester.pumpAndSettle();

      expect(find.byType(BranchDetailScreen), findsOneWidget);
    });
  });

  group('stylist profile loaded', () {
    testWidgets('shows services, stats, at-home badge', (tester) async {
      exploreRepository.barberDetail = testBarberProfile(
        services: [
          const BarberServiceDto(
            id: 'svc-1',
            name: 'Haircut',
            priceAmountMinor: 5000,
            currencyCode: 'SAR',
            durationMinutes: 30,
            isAtHome: true,
            active: true,
          ),
          const BarberServiceDto(
            id: 'svc-2',
            name: 'Beard Trim',
            priceAmountMinor: 2000,
            currencyCode: 'SAR',
            durationMinutes: 15,
            isAtHome: false,
            active: true,
          ),
        ],
        rank: 3,
        compatibilityScore: 0.85,
      );
      final bloc = StylistProfileBloc(exploreRepository, currencyRepository);
      await loadBarberProfile(tester, bloc: bloc);

      expect(find.text('Karim'), findsWidgets);
      expect(find.text('Haircut'), findsOneWidget);
      expect(find.text('Beard Trim'), findsOneWidget);
      expect(find.text('Services'), findsWidgets);
      expect(find.byIcon(Icons.home), findsOneWidget);
    });
  });

  group('stylist profile prices', () {
    testWidgets('shows the converted price only in converted-only mode', (
      tester,
    ) async {
      exploreRepository.barberDetail = testBarberProfile(
        services: [
          const BarberServiceDto(
            id: 'svc-1',
            name: 'Haircut',
            priceAmountMinor: 5000,
            currencyCode: 'SAR',
            durationMinutes: 30,
            isAtHome: false,
            active: true,
            displayPrice: DisplayPriceDto(
              amountMinor: 9000,
              currencyCode: 'EUR',
            ),
          ),
        ],
        rank: 3,
        compatibilityScore: 0.85,
      );
      final bloc = StylistProfileBloc(exploreRepository, currencyRepository);
      await loadBarberProfile(tester, bloc: bloc);

      expect(find.textContaining('EUR'), findsOneWidget);
      expect(find.textContaining('SAR'), findsNothing);
    });

    testWidgets('shows both base and converted prices in dual mode', (
      tester,
    ) async {
      exploreRepository.barberDetail = testBarberProfile(
        services: [
          const BarberServiceDto(
            id: 'svc-1',
            name: 'Haircut',
            priceAmountMinor: 5000,
            currencyCode: 'SAR',
            durationMinutes: 30,
            isAtHome: false,
            active: true,
            displayPrice: DisplayPriceDto(
              amountMinor: 9000,
              currencyCode: 'EUR',
            ),
            allowsDualPriceDisplay: true,
          ),
        ],
        rank: 3,
        compatibilityScore: 0.85,
      );
      final bloc = StylistProfileBloc(exploreRepository, currencyRepository);
      await loadBarberProfile(tester, bloc: bloc);

      expect(find.textContaining('EUR'), findsOneWidget);
      expect(find.textContaining('SAR'), findsOneWidget);
    });
  });

  group('stylist profile error', () {
    testWidgets('shows error then retry reloads', (tester) async {
      exploreRepository.error = offline();
      final bloc = StylistProfileBloc(exploreRepository, currencyRepository);
      await loadBarberProfile(tester, bloc: bloc);

      expect(find.text('Something went wrong'), findsOneWidget);
      expect(find.text('Try again'), findsOneWidget);

      exploreRepository.error = null;
      await tester.tap(find.text('Try again'));
      await tester.pumpAndSettle();

      expect(find.text('Karim'), findsWidgets);
    });
  });

  group('empty services', () {
    testWidgets('shows no-services message', (tester) async {
      exploreRepository.barberDetail = testBarberProfile(
        services: [],
        rank: null,
        compatibilityScore: null,
      );
      final bloc = StylistProfileBloc(exploreRepository, currencyRepository);
      await loadBarberProfile(tester, bloc: bloc);

      expect(find.text('No services listed yet.'), findsOneWidget);
    });
  });
}
