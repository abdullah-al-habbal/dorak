import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/reviews/stylist_reviews.bloc.dart';
import 'package:stylist_app/src/features/reviews/stylist_reviews.screen.dart';

import 'helpers/stylist_fakes.dart';

void main() {
  testWidgets('a stylist disputes a published review from the list', (
    tester,
  ) async {
    final disputes = FakeReviewDisputeRepository();
    final bloc = StylistReviewsBloc(
      FakeReviewRepository(),
      disputes,
      () => 'barber-1',
    );
    addTearDown(bloc.close);
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: StylistReviewsScreen(bloc: bloc),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('Dispute'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextFormField), 'short');
    await tester.tap(find.text('Submit dispute'));
    await tester.pumpAndSettle();
    expect(find.text('Enter at least 10 characters'), findsOneWidget);
    expect(disputes.disputedId, isNull);

    await tester.enterText(
      find.byType(TextFormField),
      'This review is about another appointment.',
    );
    await tester.tap(find.text('Submit dispute'));
    await tester.pumpAndSettle();

    expect(disputes.disputedId, 'r1');
    expect(find.text('Under admin review'), findsOneWidget);
    expect(find.text('Dispute sent. An admin will review it.'), findsOneWidget);
    expect(find.text('Dispute'), findsNothing);
  });
}
