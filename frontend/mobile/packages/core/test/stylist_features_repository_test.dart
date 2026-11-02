import 'dart:io';

import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

const _booking = {
  'id': 'booking-1',
  'starts_at': '2026-10-29T10:00:00Z',
  'booking_status': 'cancelled',
};

Object _dataFor(RequestOptions options) {
  final path = options.path;
  if (path.endsWith('/cancel')) return _booking;
  if (path.endsWith('/schedule')) {
    return [
      {
        'day_of_week': 1,
        'start_time': '09:00:00',
        'end_time': '17:00:00',
        'is_active': true,
      },
    ];
  }
  if (path.contains('/portfolio')) {
    return options.method == 'GET'
        ? [
            {'id': 'p1', 'url': 'http://x/p1.jpg', 'sort_order': 0},
          ]
        : {'id': 'p2', 'url': 'http://x/p2.jpg', 'sort_order': 1};
  }
  if (path.endsWith('/travel-radius')) {
    return {
      'id': 'b1',
      'name': 'Barber',
      'email': 'b@example.com',
      'travel_radius_km': 12.5,
    };
  }
  return {};
}

void main() {
  late List<RequestOptions> requests;
  late DioStylistOperationsRepository repository;

  setUp(() {
    requests = [];
    final fake = fakeDio(
      handler: (options) {
        requests.add(options);
        if (options.method == 'DELETE') {
          return jsonResponse(options, data: successEnvelope());
        }
        return jsonResponse(
          options,
          data: successEnvelope(data: _dataFor(options)),
        );
      },
    );
    repository = DioStylistOperationsRepository(clientWith(fake));
  });

  test('cancel is a POST carrying cancellation_reason', () async {
    await repository.cancelBooking('booking-1', reason: 'Sick');

    expect(requests.single.method, 'POST');
    expect(requests.single.path, '/barber/bookings/booking-1/cancel');
    expect(requests.single.data, {'cancellation_reason': 'Sick'});
  });

  test('schedule is read with GET and replaced with PATCH', () async {
    final days = await repository.getSchedule();
    await repository.updateSchedule(days);

    expect(requests[0].method, 'GET');
    expect(requests[0].path, '/barber/schedule');
    expect(requests[1].method, 'PATCH');
    expect(requests[1].path, '/barber/schedule');
    expect(requests[1].data, {
      'schedule': [
        {
          'day_of_week': 1,
          'start_time': '09:00:00',
          'end_time': '17:00:00',
          'is_active': true,
        },
      ],
    });
  });

  test('portfolio uses GET, multipart POST and DELETE', () async {
    final file = File('${Directory.systemTemp.path}/portfolio_photo.jpg')
      ..writeAsBytesSync([1, 2, 3]);
    addTearDown(file.deleteSync);

    final photos = await repository.getPortfolio();
    await repository.uploadPortfolioPhoto(file.path);
    await repository.deletePortfolioPhoto('p1');

    expect(photos.single.id, 'p1');
    expect(requests[0].method, 'GET');
    expect(requests[0].path, '/barber/portfolio');
    expect(requests[1].method, 'POST');
    expect(requests[1].path, '/barber/portfolio');
    expect(requests[1].data, isA<FormData>());
    expect(requests[2].method, 'DELETE');
    expect(requests[2].path, '/barber/portfolio/p1');
  });

  test('travel radius is a PATCH of travel_radius_km', () async {
    final profile = await repository.updateTravelRadius(12.5);

    expect(requests.single.method, 'PATCH');
    expect(requests.single.path, '/barber/travel-radius');
    expect(requests.single.data, {'travel_radius_km': 12.5});
    expect(profile.travelRadiusKm, 12.5);
  });
}
