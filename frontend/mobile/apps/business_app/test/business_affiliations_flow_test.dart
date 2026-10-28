import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/affiliations/business_affiliations.bloc.dart';
import 'package:business_app/src/features/affiliations/business_affiliations.screen.dart';

import 'helpers/business_fakes.dart';

void main() {
  testWidgets('accepting an affiliation removes it from the pending list', (
    tester,
  ) async {
    final bloc = BusinessAffiliationsBloc(FakeAffiliationRepository());
    addTearDown(bloc.close);
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: BusinessAffiliationsScreen(bloc: bloc),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Pending requests'), findsOneWidget);
    expect(bloc.state.pending, hasLength(1));

    await tester.tap(find.text('Accept'));
    await tester.pumpAndSettle();

    expect(bloc.state.pending, isEmpty);
    expect(find.text('Pending requests'), findsNothing);
    expect(find.text('Active'), findsOneWidget);
  });
}
