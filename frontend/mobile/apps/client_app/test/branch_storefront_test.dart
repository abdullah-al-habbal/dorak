import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/booking/branch_detail.screen.dart';
import 'package:client_app/src/features/booking/widgets/branch_storefront.widget.dart';

import 'helpers/fakes.dart';

BranchDetailDto _storefrontDetail({BranchHoursDto? today}) => BranchDetailDto(
  id: '1',
  name: 'Branch 1',
  email: 'branch1@example.com',
  status: BranchStatus.enabled,
  latitude: 33.5,
  longitude: 36.3,
  brandId: '7',
  description: 'Classic cuts since 1990',
  address: '12 Baghdad St, Damascus',
  todayHours: today,
);

Widget _host(Widget child, {Locale locale = const Locale('en')}) => MaterialApp(
  locale: locale,
  localizationsDelegates: AppLocalizations.localizationsDelegates,
  supportedLocales: AppLocalizations.supportedLocales,
  home: Scaffold(body: child),
);

void main() {
  testWidgets('renders the description, address and today\'s hours', (
    tester,
  ) async {
    await tester.pumpWidget(
      _host(
        BranchStorefront(
          detail: _storefrontDetail(
            today: const BranchHoursDto(
              date: '2026-10-24',
              opensAt: '09:00',
              closesAt: '21:00',
              source: BranchHoursSource.weekly,
            ),
          ),
        ),
      ),
    );

    expect(find.text('Classic cuts since 1990'), findsOneWidget);
    expect(find.text('12 Baghdad St, Damascus'), findsOneWidget);
    expect(find.text('Today 09:00–21:00'), findsOneWidget);
  });

  testWidgets('shows closed today in Arabic for a closing override', (
    tester,
  ) async {
    await tester.pumpWidget(
      _host(
        BranchStorefront(
          detail: _storefrontDetail(
            today: const BranchHoursDto(isClosed: true, source: BranchHoursSource.override),
          ),
        ),
        locale: const Locale('ar'),
      ),
    );

    expect(find.text('مغلق اليوم'), findsOneWidget);
  });

  testWidgets('omits the hours line when the branch has none', (tester) async {
    await tester.pumpWidget(
      _host(BranchStorefront(detail: _storefrontDetail())),
    );

    expect(find.byIcon(Icons.schedule_outlined), findsNothing);
    expect(find.text('12 Baghdad St, Damascus'), findsOneWidget);
  });

  testWidgets('branch detail screen shows the storefront from the API', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);
    final explore = FakeExploreRepository()
      ..detail = _storefrontDetail(
        today: const BranchHoursDto(opensAt: '10:00', closesAt: '18:00'),
      );
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

    expect(find.text('12 Baghdad St, Damascus'), findsOneWidget);
    expect(find.text('Today 10:00–18:00'), findsOneWidget);
  });
}
