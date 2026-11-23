import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:stylist_app/src/features/operations/stylist.bloc.dart';

import 'helpers/stylist_fakes.dart';

class _FailingProfileRepository extends FakeStylistOperationsRepository {
  _FailingProfileRepository(this.failure);

  final Object failure;

  @override
  Future<BarberProfileDto> getProfile() => Future.error(failure);
}

void main() {
  late FakeStylistOperationsRepository repository;
  late StylistBloc bloc;

  setUp(() async {
    repository = FakeStylistOperationsRepository()
      ..today = [bookingFixture('b1'), bookingFixture('b2')];
    bloc = StylistBloc(repository);
    await bloc.load();
  });

  tearDown(() => bloc.close());

  test('cancel sends a non-empty reason and drops the booking', () async {
    await bloc.cancelBooking('b1', '  Feeling sick  ');

    expect(repository.cancelledId, 'b1');
    expect(repository.cancelReason, 'Feeling sick');
    expect(bloc.state.appointments.map((booking) => booking.id), ['b2']);
    expect(bloc.state.updatingBookingId, isNull);
  });

  test('a blank reason never reaches the backend', () async {
    await bloc.cancelBooking('b1', '   ');

    expect(repository.cancelledId, isNull);
    expect(bloc.state.appointments, hasLength(2));
  });

  test('a rejected cancel keeps the booking and surfaces the error', () async {
    final failure = ApiException(
      statusCode: 422,
      code: 'UNPROCESSABLE_ENTITY',
      message: 'booking::messages.cancel_too_late',
    );
    repository.cancelError = failure;

    await bloc.cancelBooking('b1', 'Late');

    expect(bloc.state.appointments, hasLength(2));
    expect(bloc.state.error, failure);
  });

  test(
    'one failed request keeps the original error and clears loading',
    () async {
      final failure = ApiException(
        statusCode: 500,
        code: 'SERVER_ERROR',
        message: 'profile unavailable',
      );
      final failing = StylistBloc(_FailingProfileRepository(failure));

      await failing.load();

      expect(failing.state.error, same(failure));
      expect(failing.state.loading, isFalse);
      expect(failing.state.appointments, isEmpty);
      await failing.close();
    },
  );
}
