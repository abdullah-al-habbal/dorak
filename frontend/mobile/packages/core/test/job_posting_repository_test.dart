import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

void main() {
  test('job application and branch floor-plan routes are mapped', () async {
    final requests = <RequestOptions>[];
    final fake = fakeDio(
      handler: (options) {
        requests.add(options);
        final data = options.path.contains('floor-plan')
            ? {'preset': 'men_only', 'zones': []}
            : {
                'id': 'application-1',
                'job_posting_id': 'job-1',
                'barber_id': 'barber-1',
                'status': 'submitted',
              };
        return jsonResponse(options, data: successEnvelope(data: data));
      },
    );
    final repository = DioJobPostingRepository(clientWith(fake));

    await repository.apply('job-1', coverLetter: 'I am available.');
    await repository.updateBranchApplicationStatus(
      'job-1',
      'application-1',
      'accepted',
    );
    await repository.updateBranchFloorPlan(preset: 'men_only');

    expect(requests[0].path, '/jobs/job-1/apply');
    expect(requests[0].data, {'cover_letter': 'I am available.'});
    expect(
      requests[1].path,
      '/branch/job-postings/job-1/applications/application-1/status',
    );
    expect(requests[1].method, 'PATCH');
    expect(requests[1].data, {'status': 'accepted'});
    expect(requests[2].path, '/branch/floor-plan');
    expect(requests[2].method, 'PATCH');
  });
}
