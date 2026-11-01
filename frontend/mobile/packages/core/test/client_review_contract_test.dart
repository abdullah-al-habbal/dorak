import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

Map<String, dynamic> clientReview() => {
  'id': 'review-9',
  'subject_type': 'client',
  'subject_id': 'client-1',
  'rating': 2,
  'comment': 'Late',
  'status': 'published',
  'created_at': '2026-10-22T10:00:00.000Z',
};

Response<dynamic> created(RequestOptions options) => jsonResponse(
  options,
  statusCode: 201,
  data: successEnvelope(statusCode: 201, code: 'CREATED', data: clientReview()),
);

void main() {
  test('the branch rates a client on the branch review route', () async {
    late RequestOptions captured;
    final fake = fakeDio(
      handler: (options) {
        captured = options;
        return created(options);
      },
    );

    final review = await DioBranchOperationsRepository(
      clientWith(fake),
    ).rateClient('booking-1', rating: 2, comment: 'Late');

    expect(captured.method, 'POST');
    expect(captured.path, '/branch/bookings/booking-1/review');
    expect(captured.data, {'rating': 2, 'comment': 'Late'});
    expect(review.subjectType, ReviewSubjectType.client);
  });

  test('a barber rates a client on the barber review route', () async {
    late RequestOptions captured;
    final fake = fakeDio(
      handler: (options) {
        captured = options;
        return created(options);
      },
    );

    await DioStylistOperationsRepository(
      clientWith(fake),
    ).rateClient('booking-1', rating: 4);

    expect(captured.path, '/barber/bookings/booking-1/review');
    expect(captured.data, {'rating': 4});
  });

  test('staff booking payloads carry the client reputation', () {
    final booking = BookingDto.fromJson({
      'id': 'booking-1',
      'time_slot': '2026-10-22T10:00:00.000Z',
      'status': 'completed',
      'services': <dynamic>[],
      'client': {
        'id': 'client-1',
        'name': 'Sara',
        'phone': null,
        'reputation': {'average': 3.5, 'count': 2},
      },
    });

    expect(booking.client?.name, 'Sara');
    expect(booking.client?.reputation.average, 3.5);
    expect(booking.client?.reputation.count, 2);
    expect(booking.client?.reputation.isRated, isTrue);
  });

  test('client booking payloads have no client and unrated means null', () {
    final own = BookingDto.fromJson({
      'id': 'booking-1',
      'time_slot': '2026-10-22T10:00:00.000Z',
      'status': 'completed',
      'services': <dynamic>[],
    });
    final unrated = BookingClientDto.fromJson({
      'id': 'client-1',
      'reputation': {'average': null, 'count': 0},
    });

    expect(own.client, isNull);
    expect(unrated.reputation.isRated, isFalse);
  });
}
