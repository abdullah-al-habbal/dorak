import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/booking/branch_bookability.entity.dart';
import 'package:client_app/src/features/booking/branch_detail.screen.dart';
import 'package:client_app/src/features/booking/widgets/booking_mode_section.widget.dart';
import 'package:client_app/src/features/booking/widgets/booking_submit_section.widget.dart';
import 'package:client_app/src/features/booking/widgets/branch_not_bookable.widget.dart';
import 'package:client_app/src/features/booking/widgets/payment_method_section.widget.dart';
import 'package:client_app/src/features/booking/widgets/service_selection_section.widget.dart';

import 'helpers/fakes.dart';

const _service = BookingServiceDto(
  id: 'service-1',
  name: 'Fade',
  priceAmountMinor: 8000,
);
const _barber = BookingBarberDto(id: 'barber-1', name: 'Karim');

BranchDetailDto _detail({
  int chairs = 0,
  List<BookingBarberDto> barbers = const [],
  List<BookingServiceDto> services = const [],
}) => BranchDetailDto(
  id: '1',
  name: 'Branch 1',
  email: 'branch1@example.com',
  status: BranchStatus.enabled,
  latitude: 33.5,
  longitude: 36.3,
  brandId: '7',
  chairsCount: chairs,
  barbers: barbers,
  services: services,
);

Future<void> _pumpProfile(WidgetTester tester, BranchDetailDto detail) async {
  // A tall screen builds the whole lazy list, so absent sections are really absent.
  tester.view.physicalSize = const Size(800, 6000);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  final explore = FakeExploreRepository()..detail = detail;
  final bloc = fakeBranchDetailBloc(explore: explore);
  addTearDown(bloc.close);
  await tester.pumpWidget(
    MaterialApp(
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: BranchDetailScreen(
        bloc: bloc,
        branchId: '1',
        onLocaleToggle: () {},
        onViewBookings: () {},
        onBarberSelected: (_) {},
        onFavorite: (_, _) {},
        onViewReviews: (_) {},
      ),
    ),
  );
  await tester.pumpAndSettle();
}

void _expectBookingHidden() {
  expect(find.byType(BranchNotBookable, skipOffstage: false), findsOneWidget);
  expect(find.byType(BookingModeSection, skipOffstage: false), findsNothing);
  expect(
    find.byType(ServiceSelectionSection, skipOffstage: false),
    findsNothing,
  );
  expect(find.byType(PaymentMethodSection, skipOffstage: false), findsNothing);
  expect(find.byType(BookingSubmitSection, skipOffstage: false), findsNothing);
}

void main() {
  group('BranchBookability', () {
    test('needs a service and a chair or a stylist', () {
      expect(BranchBookability.isBookable(_detail()), isFalse);
      expect(
        BranchBookability.isBookable(_detail(chairs: 2, barbers: [_barber])),
        isFalse,
      );
      expect(
        BranchBookability.isBookable(_detail(services: [_service])),
        isFalse,
      );
      expect(
        BranchBookability.isBookable(_detail(chairs: 1, services: [_service])),
        isTrue,
      );
      expect(
        BranchBookability.isBookable(
          _detail(barbers: [_barber], services: [_service]),
        ),
        isTrue,
      );
    });
  });

  group('branch profile', () {
    testWidgets('hides every booking section when the branch has no services', (
      tester,
    ) async {
      await _pumpProfile(tester, _detail(chairs: 2, barbers: [_barber]));
      _expectBookingHidden();
    });

    testWidgets('hides every booking section with no chairs and no stylists', (
      tester,
    ) async {
      await _pumpProfile(tester, _detail(services: [_service]));
      _expectBookingHidden();
      expect(find.text('Booking is not available yet'), findsOneWidget);
    });

    testWidgets('shows the booking sections for a bookable branch', (
      tester,
    ) async {
      await _pumpProfile(
        tester,
        _detail(chairs: 2, barbers: [_barber], services: [_service]),
      );
      expect(find.byType(BranchNotBookable, skipOffstage: false), findsNothing);
      expect(
        find.byType(BookingModeSection, skipOffstage: false),
        findsOneWidget,
      );
      expect(
        find.byType(ServiceSelectionSection, skipOffstage: false),
        findsOneWidget,
      );
      expect(
        find.byType(PaymentMethodSection, skipOffstage: false),
        findsOneWidget,
      );
      expect(
        find.byType(BookingSubmitSection, skipOffstage: false),
        findsOneWidget,
      );
    });
  });
}
