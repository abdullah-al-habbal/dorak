import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/discovery/discovery.bloc.dart';
import 'package:client_app/src/features/discovery/discovery.event.dart';
import 'package:client_app/src/features/discovery/discovery.screen.dart';
import 'package:client_app/src/features/discovery/widgets/discovery_barber_card.widget.dart';
import 'package:client_app/src/features/discovery/widgets/discovery_result_card.widget.dart';

import 'helpers/fakes.dart';

void main() {
  testWidgets('discovery renders shops and freelancers with their own cards', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);

    final repository = FakeExploreRepository()
      ..searchBarbers = const [
        BarberProfileDto(
          id: 'barber-7',
          name: 'Karim Mobile',
          email: 'karim@example.com',
          isFreelancer: true,
          ratingAvg: 4.5,
          ratingCount: 2,
        ),
      ];
    final bloc = DiscoveryBloc(repository, FakeLocationProvider());
    addTearDown(bloc.close);
    String? openedStylist;

    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: DiscoveryScreen(
          bloc: bloc,
          onLocaleToggle: () {},
          onBookNow: () {},
          onViewDetails: (_) {},
          onViewStylist: (id) => openedStylist = id,
        ),
      ),
    );
    bloc.add(const DiscoveryLocationRequested());
    await tester.pumpAndSettle();

    expect(find.byType(DiscoveryResultCard), findsOneWidget);
    expect(find.byType(DiscoveryBarberCard), findsOneWidget);
    expect(find.text('Karim Mobile'), findsOneWidget);
    expect(find.textContaining('Freelancer'), findsOneWidget);
    expect(find.textContaining('★ 4.5 (2 reviews)'), findsOneWidget);

    await tester.ensureVisible(
      find.descendant(
        of: find.byType(DiscoveryBarberCard),
        matching: find.text('View Details'),
      ),
    );
    await tester.tap(
      find.descendant(
        of: find.byType(DiscoveryBarberCard),
        matching: find.text('View Details'),
      ),
    );
    expect(openedStylist, 'barber-7');
  });
}
