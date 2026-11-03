import 'dart:io';

import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

const _visit = {
  'id': 'history-1',
  'booking_id': 'booking-1',
  'performed_at': '2026-08-30T11:00:00.000Z',
  'catalog_item': {
    'id': 'catalog-1',
    'name': {'en': 'Classic Fade', 'ar': 'فيض كلاسيكي'},
  },
  'media': [
    {
      'id': 'media-1',
      'photo_url': 'https://cdn.dorak.io/history/media-1.jpg',
      'photo_type': 'before',
      'uploaded_at': '2026-08-30T12:00:00.000Z',
    },
  ],
};

void main() {
  test('getClientHistory reads the barber route and media tags', () async {
    late RequestOptions captured;
    final fake = fakeDio(
      handler: (options) {
        captured = options;
        return jsonResponse(
          options,
          data: successEnvelope(
            data: [_visit],
            meta: {
              'pagination': {
                'total': 1,
                'count': 1,
                'per_page': 50,
                'current_page': 1,
                'total_pages': 1,
              },
            },
          ),
        );
      },
    );

    final page = await DioBarberHistoryRepository(
      clientWith(fake),
    ).getClientHistory('client-1', perPage: 50);

    expect(captured.method, 'GET');
    expect(captured.path, '/barber/clients/client-1/history');
    expect(captured.queryParameters, {'page': 1, 'per_page': 50});
    expect(page.data.single.media.single.photoType, 'before');
  });

  test('attachMedia posts multipart to the barber media route', () async {
    late RequestOptions captured;
    final fake = fakeDio(
      handler: (options) {
        captured = options;
        return jsonResponse(
          options,
          statusCode: 201,
          data: successEnvelope(
            statusCode: 201,
            code: 'CREATED',
            data: {
              'id': 'media-2',
              'photo_url': 'https://cdn.dorak.io/history/media-2.jpg',
              'photo_type': 'reference',
              'uploaded_at': '2026-08-30T12:00:00.000Z',
            },
          ),
        );
      },
    );
    final file = File('${Directory.systemTemp.path}/barber_history_test.jpg')
      ..writeAsBytesSync([1, 2, 3]);
    addTearDown(file.deleteSync);

    final media = await DioBarberHistoryRepository(clientWith(fake))
        .attachMedia(
          historyId: 'history-1',
          photoPath: file.path,
          photoType: 'reference',
        );

    expect(captured.method, 'POST');
    expect(captured.path, '/barber/history/history-1/media');
    final form = captured.data as FormData;
    expect(form.fields.single.key, 'photo_type');
    expect(form.fields.single.value, 'reference');
    expect(form.files.single.key, 'photo');
    expect(media.photoType, 'reference');
  });
}
