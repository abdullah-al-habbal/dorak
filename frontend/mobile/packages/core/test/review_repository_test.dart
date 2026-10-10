import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

Map<String, dynamic> review({
  String id = 'review-1',
  int rating = 5,
  String? comment = 'Great fade',
  String? authorName = 'Karim',
  String createdAt = '2026-09-10T12:00:00.000Z',
}) => {
  'id': id,
  'rating': rating,
  'comment': comment,
  'author_name': authorName,
  'created_at': createdAt,
};

void main() {
  group('DioReviewRepository', () {
    test(
      'submitReview posts rating and comment to the booking review route',
      () async {
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
                data: review(),
              ),
            );
          },
        );
        final repository = DioReviewRepository(clientWith(fake));

        final result = await repository.submitReview(
          'booking-1',
          rating: 4,
          comment: 'Nice cut',
        );

        expect(captured.path, '/client/bookings/booking-1/review');
        expect(captured.method, 'POST');
        expect(captured.data, {'rating': 4, 'comment': 'Nice cut'});
        expect(result.id, 'review-1');
        expect(result.rating, 5);
        expect(result.comment, 'Great fade');
        expect(result.authorName, 'Karim');
        expect(result.createdAt, DateTime.parse('2026-09-10T12:00:00.000Z'));
      },
    );

    test('submitReview omits the comment when null', () async {
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
              data: review(comment: null, authorName: null),
            ),
          );
        },
      );
      final repository = DioReviewRepository(clientWith(fake));

      await repository.submitReview('booking-1', rating: 3);

      expect(captured.data, {'rating': 3});
    });

    test('submitReview surfaces a 409 already-reviewed conflict', () async {
      final fake = fakeDio(
        handler: (options) => jsonResponse(
          options,
          statusCode: 409,
          data: errorEnvelope(
            code: 'REVIEW_VALIDATION_FAILED',
            statusCode: 409,
            message: 'review::messages.already_reviewed',
          ),
        ),
      );
      final repository = DioReviewRepository(clientWith(fake));

      await expectLater(
        repository.submitReview('booking-1', rating: 5),
        throwsA(
          isA<ApiException>().having((e) => e.statusCode, 'statusCode', 409),
        ),
      );
    });

    test('submitReview surfaces a 403 not-own-booking', () async {
      final fake = fakeDio(
        handler: (options) => jsonResponse(
          options,
          statusCode: 403,
          data: errorEnvelope(
            code: 'REVIEW_VALIDATION_FAILED',
            statusCode: 403,
            message: 'review::messages.not_own_booking',
          ),
        ),
      );
      final repository = DioReviewRepository(clientWith(fake));

      await expectLater(
        repository.submitReview('booking-1', rating: 5),
        throwsA(
          isA<ApiException>().having((e) => e.isForbidden, 'isForbidden', true),
        ),
      );
    });

    test('submitReview surfaces a 422 booking-not-completed', () async {
      final fake = fakeDio(
        handler: (options) => jsonResponse(
          options,
          statusCode: 422,
          data: errorEnvelope(
            code: 'REVIEW_VALIDATION_FAILED',
            statusCode: 422,
            message: 'review::messages.booking_not_completed',
          ),
        ),
      );
      final repository = DioReviewRepository(clientWith(fake));

      await expectLater(
        repository.submitReview('booking-1', rating: 5),
        throwsA(isA<ApiException>()),
      );
    });

    test('getBranchReviews parses the paged review list', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            data: successEnvelope(
              data: [
                review(id: 'r1', rating: 5),
                review(id: 'r2', rating: 3, comment: null, authorName: null),
              ],
              meta: {
                'pagination': {
                  'total': 2,
                  'count': 2,
                  'per_page': 20,
                  'current_page': 1,
                  'total_pages': 1,
                },
              },
            ),
          );
        },
      );
      final repository = DioReviewRepository(clientWith(fake));

      final page = await repository.getBranchReviews('branch-1');

      expect(captured.path, '/branches/branch-1/reviews');
      expect(captured.queryParameters['page'], 1);
      expect(captured.queryParameters['per_page'], 20);
      expect(page.data, hasLength(2));
      expect(page.data.first.rating, 5);
      expect(page.data.first.authorName, 'Karim');
      expect(page.data.last.rating, 3);
      expect(page.data.last.comment, isNull);
      expect(page.data.last.authorName, isNull);
    });

    test('getBranchReviews sends the page parameter', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            data: successEnvelope(
              data: const [],
              meta: {
                'pagination': {
                  'total': 0,
                  'count': 0,
                  'per_page': 20,
                  'current_page': 2,
                  'total_pages': 1,
                },
              },
            ),
          );
        },
      );
      final repository = DioReviewRepository(clientWith(fake));

      await repository.getBranchReviews('branch-1', page: 2);

      expect(captured.queryParameters['page'], 2);
    });
  });
}
