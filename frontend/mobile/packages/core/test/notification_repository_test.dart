import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

Map<String, Object?> notification({
  String id = 'notification-1',
  String? readAt,
}) => {
  'id': id,
  'type': 'booking_update',
  'title': 'Booking updated',
  'body': 'Your booking is confirmed',
  'data': {'booking_id': 'booking-1', 'status': 'confirmed'},
  'read_at': readAt,
  'created_at': '2026-10-22T10:00:00.000Z',
};

void main() {
  group('DioNotificationRepository', () {
    test('getNotifications sends paging params and parses rows', () async {
      RequestOptions? captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            data: successEnvelope(
              data: [
                notification(),
                notification(
                  id: 'notification-2',
                  readAt: '2026-10-22T11:00:00.000Z',
                ),
              ],
              meta: {
                'pagination': {
                  'total': 2,
                  'count': 2,
                  'per_page': 20,
                  'current_page': 1,
                  'total_pages': 1,
                },
                'unread_count': 1,
              },
            ),
          );
        },
      );
      final repository = DioNotificationRepository(clientWith(fake));

      final page = await repository.getNotifications(page: 2, perPage: 20);

      expect(captured?.method, 'GET');
      expect(captured?.path, NotificationEndpoints.notifications);
      expect(captured?.queryParameters, {'page': 2, 'per_page': 20});
      expect(page.meta.total, 2);
      expect(page.data.first.id, 'notification-1');
      expect(page.data.first.type, 'booking_update');
      expect(page.data.first.data['booking_id'], 'booking-1');
      expect(page.data.first.isUnread, isTrue);
      expect(page.data.last.isUnread, isFalse);
      expect(page.data.last.readAt, DateTime.parse('2026-10-22T11:00:00.000Z'));
    });

    test('markRead patches the notification and parses it', () async {
      RequestOptions? captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            data: successEnvelope(
              data: notification(readAt: '2026-10-22T11:00:00.000Z'),
            ),
          );
        },
      );
      final repository = DioNotificationRepository(clientWith(fake));

      final updated = await repository.markRead('notification-1');

      expect(captured?.method, 'PATCH');
      expect(captured?.path, '/notifications/notification-1/read');
      expect(updated.isUnread, isFalse);
    });

    test('markAllRead posts to read-all', () async {
      RequestOptions? captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            data: successEnvelope(data: {'updated': 2, 'unread_count': 0}),
          );
        },
      );
      final repository = DioNotificationRepository(clientWith(fake));

      await repository.markAllRead();

      expect(captured?.method, 'POST');
      expect(captured?.path, NotificationEndpoints.markAllRead);
    });

    test('markRead surfaces a 404 as an ApiException', () async {
      final fake = fakeDio(
        handler: (options) => jsonResponse(
          options,
          statusCode: 404,
          data: errorEnvelope(code: 'RESOURCE_NOT_FOUND', statusCode: 404),
        ),
      );
      final repository = DioNotificationRepository(clientWith(fake));

      await expectLater(
        repository.markRead('missing'),
        throwsA(isA<ApiException>()),
      );
    });
  });
}
