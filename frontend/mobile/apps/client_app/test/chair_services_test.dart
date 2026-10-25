import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/booking/branch_detail.screen.dart';
import 'package:client_app/src/features/booking/widgets/chair_services.widget.dart';

import 'helpers/fakes.dart';

void main() {
  Future<void> pumpBranchDetail(
    WidgetTester tester,
    FakeBranchRepository branches,
  ) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);
    final bloc = fakeBranchDetailBloc(branches: branches);
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
        ),
      ),
    );
    await tester.pumpAndSettle();
  }

  testWidgets('tapping a seated chair shows that barber\'s services', (
    tester,
  ) async {
    final branches = FakeBranchRepository()
      ..plan = const FloorPlanDto(
        branchId: '1',
        branchName: 'Branch 1',
        chairs: [
          FloorChairDto(
            id: 'chair-1',
            label: 'A',
            status: ChairStatus.available,
            servicesSource: 'barber',
            barber: FloorChairBarberDto(
              id: 'barber-1',
              name: 'Karim',
              services: [BookingServiceDto(id: 's-1', name: 'Skin Fade')],
            ),
          ),
        ],
        branchServices: [BookingServiceDto(id: 's-9', name: 'Kids Cut')],
      );
    await pumpBranchDetail(tester, branches);

    expect(find.byType(ChairServices), findsNothing);
    await tester.ensureVisible(find.text('A'));
    await tester.tap(find.text('A'));
    await tester.pumpAndSettle();

    expect(find.byType(ChairServices), findsOneWidget);
    expect(find.text('Services by Karim'), findsOneWidget);
    expect(
      find.descendant(
        of: find.byType(ChairServices),
        matching: find.text('Skin Fade'),
      ),
      findsOneWidget,
    );
  });

  testWidgets('tapping an empty chair shows the shop menu', (tester) async {
    final branches = FakeBranchRepository()
      ..plan = const FloorPlanDto(
        branchId: '1',
        branchName: 'Branch 1',
        chairs: [
          FloorChairDto(id: 'chair-1', label: 'A', status: ChairStatus.available),
        ],
        branchServices: [BookingServiceDto(id: 's-9', name: 'Kids Cut')],
      );
    await pumpBranchDetail(tester, branches);

    await tester.ensureVisible(find.text('A'));
    await tester.tap(find.text('A'));
    await tester.pumpAndSettle();

    expect(find.text('Shop menu'), findsOneWidget);
    expect(
      find.descendant(
        of: find.byType(ChairServices),
        matching: find.text('Kids Cut'),
      ),
      findsOneWidget,
    );
  });
}
