import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/booking/widgets/floor_plan_grid.widget.dart';

void main() {
  testWidgets('groups chairs by zone and honors dynamic availability', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);
    String? selectedChairId;

    await tester.pumpWidget(
      MaterialApp(
        theme: DorakTheme.forLocale(const Locale('en'), Brightness.light),
        locale: const Locale('en'),
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: Scaffold(
          body: FloorPlanGrid(
            chairs: const [
              FloorChairDto(
                id: 'men-1',
                label: 'Men 1',
                status: ChairStatus.occupied,
                availability: ChairStatus.available,
                floorZone: 'men',
              ),
              FloorChairDto(
                id: 'women-1',
                label: 'Women 1',
                status: ChairStatus.available,
                availability: ChairStatus.occupied,
                floorZone: 'women',
              ),
              FloorChairDto(
                id: 'shared-1',
                label: 'Shared 1',
                status: ChairStatus.available,
                floorZone: 'shared',
              ),
            ],
            zones: const [
              FloorPlanZoneDto(zone: 'men', x: 0, y: 0, width: 50, height: 50),
              FloorPlanZoneDto(
                zone: 'women',
                x: 50,
                y: 0,
                width: 50,
                height: 50,
              ),
              FloorPlanZoneDto(
                zone: 'shared',
                x: 0,
                y: 50,
                width: 100,
                height: 50,
              ),
            ],
            selectedChairId: null,
            onChairSelected: (id) => selectedChairId = id,
            availableLabel: 'Available',
            occupiedLabel: 'Occupied',
          ),
        ),
      ),
    );

    expect(find.text("Men's zone"), findsOneWidget);
    expect(find.text("Women's zone"), findsOneWidget);
    expect(find.text('Shared zone'), findsOneWidget);

    await tester.tap(find.text('Men 1'));
    expect(selectedChairId, 'men-1');
    await tester.tap(find.text('Women 1'));
    expect(selectedChairId, 'men-1');
  });
}
