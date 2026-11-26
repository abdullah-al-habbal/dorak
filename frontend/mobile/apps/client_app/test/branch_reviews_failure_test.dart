import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/reviews/branch_reviews.bloc.dart';
import 'package:client_app/src/features/reviews/branch_reviews.screen.dart';

import 'helpers/fakes.dart';

void main() {
  Future<void> pumpFailing(WidgetTester tester, Object failure) async {
    final bloc = BranchReviewsBloc(
      FakeReviewRepository()..reviewsError = failure,
    );
    addTearDown(bloc.close);
    await tester.pumpWidget(
      MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: BranchReviewsScreen(bloc: bloc, branchId: 'branch-1'),
      ),
    );
    await tester.pumpAndSettle();
  }

  testWidgets('a server failure is not shown as no connection', (tester) async {
    await pumpFailing(
      tester,
      const ApiException(
        statusCode: 502,
        code: 'INVALID_RESPONSE',
        message: 'raw',
      ),
    );

    expect(
      find.text('Something went wrong. Please try again.'),
      findsOneWidget,
    );
    expect(find.textContaining('No connection'), findsNothing);
  });

  testWidgets('a transport failure says there is no connection', (
    tester,
  ) async {
    await pumpFailing(
      tester,
      const NetworkException(
        type: DioExceptionType.connectionError,
        retryable: true,
        message: 'raw',
      ),
    );

    expect(find.textContaining('No connection'), findsOneWidget);
  });
}
