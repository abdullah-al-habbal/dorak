import 'dart:io';

import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

Map<String, Object?> history({
  String id = 'history-1',
  String? branchId = 'branch-1',
}) => {
  'id': id,
  'client_id': 'client-1',
  'booking_id': 'booking-1',
  'barber_id': 'barber-1',
  'branch_id': branchId,
  'offered_service_id': 'service-1',
  'catalog_item_id': 'catalog-1',
  'performed_at': '2026-08-30T11:00:00.000Z',
  'client_rating': 5,
  'client_notes': 'Great fade',
  'barber_notes': null,
  'service_details': null,
  'barber': {'id': 'barber-1', 'name': 'Karim'},
  'branch': {'id': branchId, 'name': 'Riyadh Downtown'},
  'catalog_item': {
    'id': 'catalog-1',
    'name': {'en': 'Classic Fade', 'ar': 'فيض كلاسيكي'},
  },
  'media': [
    {
      'id': 'media-1',
      'photo_url': 'https://cdn.dorak.io/history/media-1.jpg',
      'photo_type': 'after',
      'uploaded_at': '2026-08-30T12:00:00.000Z',
    },
  ],
  'created_at': '2026-08-30T12:00:00.000Z',
  'updated_at': '2026-08-30T12:00:00.000Z',
};

void main() {
  group('DioHistoryRepository', () {
    test('getHistory parses items with nested relations', () async {
      final fake = fakeDio(
        handler: (options) => jsonResponse(
          options,
          data: successEnvelope(
            data: [history()],
            meta: {
              'pagination': {
                'total': 1,
                'count': 1,
                'per_page': 15,
                'current_page': 1,
                'total_pages': 1,
              },
            },
          ),
        ),
      );
      final repository = DioHistoryRepository(clientWith(fake));

      final page = await repository.getHistory();

      expect(page.data, hasLength(1));
      final item = page.data.first;
      expect(item.id, 'history-1');
      expect(item.bookingId, 'booking-1');
      expect(item.catalogItemId, 'catalog-1');
      expect(item.performedAt, DateTime.parse('2026-08-30T11:00:00.000Z'));
      expect(item.clientRating, 5);
      expect(item.clientNotes, 'Great fade');
      expect(item.barber?.name, 'Karim');
      expect(item.branch?.name, 'Riyadh Downtown');
      expect(item.catalogItem?.name, {
        'en': 'Classic Fade',
        'ar': 'فيض كلاسيكي',
      });
      expect(item.media, hasLength(1));
      expect(
        item.media.first.photoUrl,
        'https://cdn.dorak.io/history/media-1.jpg',
      );
      expect(fake.callCount, 1);
    });

    test('getHistory sends pagination parameters', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(options, data: successEnvelope(data: const []));
        },
      );
      final repository = DioHistoryRepository(clientWith(fake));

      await repository.getHistory(page: 2, perPage: 30);

      expect(captured.path, HistoryEndpoints.history);
      expect(captured.queryParameters['page'], 2);
      expect(captured.queryParameters['per_page'], 30);
    });

    test('rebookFromHistory posts the picked time as a branch time', () async {
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
                'id': 'booking-2',
                'starts_at': '2026-09-20T09:00:00.000Z',
                'booking_status': 'pending',
                'barber_id': 'barber-1',
              },
            ),
          );
        },
      );
      final repository = DioHistoryRepository(clientWith(fake));

      final created = await repository.rebookFromHistory(
        'history-1',
        DateTime(2026, 9, 20, 9),
      );

      expect(captured.path, '/client/history/history-1/rebook');
      expect(captured.method, 'POST');
      expect(captured.data, {'starts_at_local': '2026-09-20T09:00'});
      expect(created.id, 'booking-2');
      expect(created.status, BookingStatus.pending);
      expect(created.barber?.name, isNull);
    });

    test(
      'rebook and media attachment surface forbidden responses as ApiException',
      () async {
        final file = File('${Directory.systemTemp.path}/history-photo.jpg')
          ..writeAsStringSync('photo bytes');
        addTearDown(file.deleteSync);
        final fake = fakeDio(
          handler: (options) => jsonResponse(
            options,
            statusCode: 403,
            data: errorEnvelope(
              statusCode: 403,
              code: 'FORBIDDEN',
              message: 'Forbidden',
            ),
          ),
        );
        final repository = DioHistoryRepository(clientWith(fake));

        final forbidden = isA<ApiException>().having(
          (error) => error.isForbidden,
          'isForbidden',
          isTrue,
        );

        await expectLater(
          repository.rebookFromHistory(
            'history-1',
            DateTime.utc(2026, 9, 20, 9),
          ),
          throwsA(forbidden),
        );
        await expectLater(
          repository.attachMedia(
            historyId: 'history-1',
            photoPath: file.path,
            photoType: 'after',
          ),
          throwsA(forbidden),
        );
      },
    );

    test('attachMedia posts a multipart photo file', () async {
      late RequestOptions captured;
      final file = File('${Directory.systemTemp.path}/history-photo.jpg')
        ..writeAsStringSync('photo bytes');
      addTearDown(file.deleteSync);
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
                'photo_url': 'https://dorak.test/signed/media-2',
                'uploaded_at': '2026-09-20T09:00:00.000Z',
              },
            ),
          );
        },
      );
      final repository = DioHistoryRepository(clientWith(fake));

      final media = await repository.attachMedia(
        historyId: 'history-1',
        photoPath: file.path,
        photoType: 'after',
      );

      expect(captured.path, '/client/history/history-1/media');
      expect(captured.method, 'POST');
      final formData = captured.data as FormData;
      expect(formData.files.single.key, 'photo');
      expect(formData.files.single.value.filename, 'history-photo.jpg');
      expect(formData.fields.single.key, 'photo_type');
      expect(formData.fields.single.value, 'after');
      expect(media.id, 'media-2');
      expect(media.photoUrl, 'https://dorak.test/signed/media-2');
    });
  });
}
