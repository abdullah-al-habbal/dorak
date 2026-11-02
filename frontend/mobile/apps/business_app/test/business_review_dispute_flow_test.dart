import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/reviews/business_reviews.bloc.dart';
import 'package:business_app/src/features/reviews/business_reviews.screen.dart';

import 'helpers/business_fakes.dart';

void main() {
  testWidgets('a manager disputes a published review from the list', (
    tester,
  ) async {
    final disputes = FakeReviewDisputeRepository();
    final bloc = BusinessReviewsBloc(
      FakeBranchManagementRepository(),
      disputes,
    );
    addTearDown(bloc.close);
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: BusinessReviewsScreen(bloc: bloc),
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
