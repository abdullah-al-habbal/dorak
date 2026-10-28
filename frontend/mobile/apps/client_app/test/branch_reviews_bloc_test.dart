import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/features/reviews/branch_reviews.bloc.dart';

import 'helpers/fakes.dart';

PaginatedData<ReviewDto> pageOf(String id, int current, int total) =>
    PaginatedData(
      data: [testReview(id: id)],
      meta: PaginationMeta(
        total: total,
        count: 1,
        perPage: 1,
        currentPage: current,
        totalPages: total,
      ),
    );

void main() {
  late FakeReviewRepository repository;

  setUp(() {
    repository = FakeReviewRepository()
      ..reviewsPage = pageOf('r1', 1, 2)
      ..moreReviewsPage = pageOf('r2', 2, 2);
  });

  test('load fetches the first page of branch reviews', () async {
    final bloc = BranchReviewsBloc(repository);
    addTearDown(bloc.close);

    await bloc.load('branch-1');

    expect(repository.lastReviewsPage, 1);
    expect(bloc.state.items.map((review) => review.id), ['r1']);
    expect(bloc.state.hasMore, isTrue);
  });

  test('loadMore appends the next page and stops at the last one', () async {
    final bloc = BranchReviewsBloc(repository);
    addTearDown(bloc.close);
    await bloc.load('branch-1');

    await bloc.loadMore();
    await bloc.loadMore();

    expect(repository.lastReviewsPage, 2);
    expect(repository.reviewsCalls, 2);
    expect(bloc.state.items.map((review) => review.id), ['r1', 'r2']);
    expect(bloc.state.hasMore, isFalse);
  });

  test('a failed first load reports the failure and retry reloads', () async {
    repository.reviewsError = offline();
    final bloc = BranchReviewsBloc(repository);
    addTearDown(bloc.close);

    await bloc.load('branch-1');
    expect(bloc.state.hasFailedFirst, isTrue);

    repository.reviewsError = null;
    await bloc.retry();
    expect(bloc.state.items, hasLength(1));
  });
}
