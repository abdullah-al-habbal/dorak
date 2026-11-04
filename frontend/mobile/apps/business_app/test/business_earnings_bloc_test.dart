import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:business_app/src/features/earnings/business_earnings.bloc.dart';
import 'package:business_app/src/features/earnings/earnings_range.entity.dart';

import 'helpers/business_fakes.dart';

const _usd = EarningsTotalDto(
  currencyCode: 'USD',
  grossMinor: 12500,
  commissionMinor: 2500,
  netMinor: 10000,
  completedBookingsCount: 4,
);

void main() {
  final now = DateTime(2026, 11, 4, 12);
  late FakeEarningsRepository repository;
  late BusinessEarningsBloc bloc;

  setUp(() {
    repository = FakeEarningsRepository()
      ..earnings = const EarningsDto(scope: 'branch', totals: [_usd]);
    bloc = BusinessEarningsBloc(repository, clock: () => now);
    addTearDown(bloc.close);
  });

  test('starts on the current month with nothing loaded', () {
    expect(bloc.state.range, EarningsRange.month);
    expect(bloc.state.earnings, isNull);
    expect(bloc.state.loading, isFalse);
  });

  test('load queries from the first of the month up to now', () async {
    await bloc.load();

    expect(repository.calls, [(from: DateTime(2026, 11), to: now)]);
    expect(bloc.state.earnings?.totals, [_usd]);
    expect(bloc.state.loading, isFalse);
    expect(bloc.state.error, isNull);
  });

  test('selecting all-time reloads without a date range', () async {
    await bloc.load();
    await bloc.selectRange(EarningsRange.all);

    expect(repository.calls.last, (from: null, to: null));
    expect(bloc.state.range, EarningsRange.all);
  });

  test('re-selecting the loaded range does not refetch', () async {
    await bloc.load();
    await bloc.selectRange(EarningsRange.month);

    expect(repository.calls, hasLength(1));
  });

  test('selecting a range before the first load still fetches', () async {
    await bloc.selectRange(EarningsRange.month);

    expect(repository.calls, hasLength(1));
  });

  test('a failure surfaces in state and keeps earlier totals', () async {
    await bloc.load();
    repository.failure = StateError('offline');

    await bloc.load();

    expect(bloc.state.error, isA<StateError>());
    expect(bloc.state.loading, isFalse);
    expect(bloc.state.earnings?.totals, [_usd]);
  });

  test('a successful retry clears the previous error', () async {
    repository.failure = StateError('offline');
    await bloc.load();
    repository.failure = null;

    await bloc.load();

    expect(bloc.state.error, isNull);
    expect(bloc.state.earnings?.totals, [_usd]);
  });

  test('a response arriving after close does not emit', () async {
    final pending = bloc.load();
    await bloc.close();

    await pending;

    expect(bloc.isClosed, isTrue);
  });
}
