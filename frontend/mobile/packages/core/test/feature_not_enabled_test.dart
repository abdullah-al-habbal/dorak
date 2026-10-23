import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

void main() {
  test(
    'a 403 feature_not_enabled surfaces as a typed failure on job postings',
    () async {
      final fake = fakeDio(
        handler: (options) => jsonResponse(
          options,
          statusCode: 403,
          data: errorEnvelope(
            code: 'feature_not_enabled',
            statusCode: 403,
            message: 'This needs the job_board feature.',
            errors: {
              'feature': ['job_board'],
            },
          ),
        ),
      );

      await expectLater(
        DioJobPostingRepository(clientWith(fake)).saveBranchJobPosting(const {
          'title': {'en': 'Barber', 'ar': 'حلاق'},
          'description': {'en': 'Join us', 'ar': 'انضم إلينا'},
        }),
        throwsA(
          isA<FeatureNotEnabledException>()
              .having((e) => e.statusCode, 'statusCode', 403)
              .having((e) => e.feature, 'feature', 'job_board'),
        ),
      );
    },
  );
}
