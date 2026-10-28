import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/core/navigation/app_routes.entity.dart';
import 'package:client_app/src/features/reviews/branch_reviews.bloc.dart';
import 'package:client_app/src/features/reviews/branch_reviews.screen.dart';

import 'helpers/fakes.dart';

void main() {
  testWidgets('branch reviews screen lists the loaded reviews', (tester) async {
    tester.view.physicalSize = const Size(1290, 2796);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.reset);

    final reviews = FakeReviewRepository()
      ..reviewsPage = testReviewPage([testReview(comment: 'Sharp fade')]);
    final bloc = BranchReviewsBloc(reviews);
    addTearDown(bloc.close);
    final pair = sessionPair(
      FakeAuthRepository(),
      InMemoryTokenStorage('stored-token'),
    );
    addTearDown(pair.coordinator.cancel);
    final router = buildRouter(
      session: pair.session,
      auth: pair.auth,
      branchReviews: bloc,
      preferences: InMemoryAppPreferences(dontShowOnboarding: true),
      apiClient: fakeApiClient(),
    );
    await tester.pumpWidget(routerHarness(router));
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pump(const Duration(seconds: 3));
    await tester.pumpAndSettle();

    router.router.go(AppRoutes.branchReviews('branch-1'));
    await tester.pumpAndSettle();

    expect(find.byType(BranchReviewsScreen), findsOneWidget);
    expect(find.text('Sharp fade'), findsOneWidget);
  });
}
