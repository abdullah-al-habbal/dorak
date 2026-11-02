import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

const _reason = 'This review was submitted against the wrong appointment.';

const _disputed = {
  'id': 'review-1',
  'subject_type': 'branch',
  'subject_id': 'branch-1',
  'rating': 1,
  'status': 'disputed',
  'disputed_at': '2026-11-03T10:00:00.000Z',
  'created_at': '2026-11-02T10:00:00.000Z',
};

void main() {
  late RequestOptions captured;
  late ApiClient client;

  setUp(() {
    final fake = fakeDio(
      handler: (options) {
        captured = options;
        return jsonResponse(options, data: successEnvelope(data: _disputed));
      },
    );
    client = clientWith(fake);
  });

  test(
    'branch repository posts the reason to the branch dispute route',
    () async {
      final review = await DioBranchReviewDisputeRepository(
        client,
      ).flagDispute('review-1', reason: _reason);

      expect(captured.method, 'POST');
      expect(captured.path, '/branch/reviews/review-1/dispute');
      expect(captured.data, {'reason': _reason});
      expect(review.disputed, isTrue);
      expect(review.disputedAt, DateTime.parse('2026-11-03T10:00:00.000Z'));
    },
  );

  test(
    'barber repository posts the reason to the barber dispute route',
    () async {
      final review = await DioBarberReviewDisputeRepository(
        client,
      ).flagDispute('review-1', reason: _reason);

      expect(captured.method, 'POST');
      expect(captured.path, '/barber/reviews/review-1/dispute');
      expect(captured.data, {'reason': _reason});
      expect(review.status, ReviewStatus.disputed);
    },
  );
}
