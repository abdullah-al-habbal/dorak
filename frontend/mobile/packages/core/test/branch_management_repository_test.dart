import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

const _job = {
  'id': 'j1',
  'title': {'en': 'Barber', 'ar': 'حلاق'},
  'description': {'en': 'Fade', 'ar': 'قص'},
  'status': 'open',
  'branch_id': 'br1',
};

const _application = {
  'id': 'app1',
  'job_posting_id': 'j1',
  'barber_id': 'b1',
  'status': 'accepted',
};

const _affiliation = {
  'id': 'a1',
  'barber_id': 'b1',
  'affiliable_id': 'br1',
  'affiliable_type': 'branch',
  'status': 'active',
};

void main() {
  late List<RequestOptions> requests;
  late ApiClient client;

  String route(int index) =>
      '${requests[index].method} ${requests[index].path}';

  setUp(() {
    requests = [];
    final fake = fakeDio(
      handler: (options) {
        requests.add(options);
        final path = options.path;
        if (options.method == 'DELETE') {
          return jsonResponse(options, data: successEnvelope());
        }
        final Object data;
        if (path.contains('floor-plan')) {
          data = {'preset': 'compact'};
        } else if (path.endsWith('/branch/profile')) {
          data = {};
        } else if (path.contains('/status')) {
          data = _application;
        } else if (path.contains('/applications')) {
          data = [_application];
        } else if (path.contains('affiliations')) {
          data = options.method == 'GET' ? [_affiliation] : _affiliation;
        } else if (path.endsWith('/job-postings') && options.method == 'GET') {
          data = [_job];
        } else if (path.endsWith('/reviews')) {
          data = [
            {'id': 'r1', 'rating': 5, 'created_at': '2026-10-29T10:00:00Z'},
          ];
        } else {
          data = _job;
        }
        return jsonResponse(options, data: successEnvelope(data: data));
      },
    );
    client = clientWith(fake);
  });

  test('floor plan, profile and reviews map to the branch routes', () async {
    final repository = DioBranchManagementRepository(client);

    await repository.updateFloorPlan(preset: 'compact');
    await repository.updateProfile(
      description: {'en': 'Hello'},
      tags: [
        {'en': 'fade', 'ar': 'تدريج'},
      ],
    );
    final reviews = await repository.getReviews();

    expect(route(0), 'PATCH /branch/floor-plan');
    expect(requests[0].data, {'preset': 'compact', 'zones': <Object>[]});
    expect(route(1), 'PATCH /branch/profile');
    expect(requests[1].data, {
      'description': {'en': 'Hello'},
      'tags': [
        {'en': 'fade', 'ar': 'تدريج'},
      ],
    });
    expect(route(2), 'GET /branch/reviews');
    expect(reviews.data.single.id, 'r1');
  });

  test('job posting calls map to the branch routes', () async {
    final repository = DioJobPostingRepository(client);

    await repository.getBranchJobPostings();
    await repository.saveBranchJobPosting({'title': {}});
    await repository.saveBranchJobPosting({'title': {}}, id: 'j1');
    await repository.deleteBranchJobPosting('j1');
    await repository.getBranchApplications('j1');
    await repository.markBranchApplicationsSeen('j1');
    await repository.updateBranchApplicationStatus('j1', 'app1', 'accepted');

    expect(
      [for (var i = 0; i < requests.length; i++) route(i)],
      [
        'GET /branch/job-postings',
        'POST /branch/job-postings',
        'PUT /branch/job-postings/j1',
        'DELETE /branch/job-postings/j1',
        'GET /branch/job-postings/j1/applications',
        'POST /branch/job-postings/j1/applications/mark-seen',
        'PATCH /branch/job-postings/j1/applications/app1/status',
      ],
    );
  });

  test('branch affiliation calls map to the branch routes', () async {
    final repository = DioAffiliationRepository(client);

    await repository.getBranchAffiliations();
    await repository.acceptBranchAffiliation('a1');
    await repository.rejectBranchAffiliation('a1');
    await repository.terminateBranchAffiliation('a1');
    await repository.inviteBarber('b1');

    expect(
      [for (var i = 0; i < requests.length; i++) route(i)],
      [
        'GET /branch/affiliations',
        'POST /branch/affiliations/a1/accept',
        'POST /branch/affiliations/a1/reject',
        'POST /branch/affiliations/a1/terminate',
        'POST /branch/affiliations',
      ],
    );
  });

  test('chair status is a PATCH on the branch chair route', () async {
    final fake = fakeDio(
      handler: (options) {
        requests.add(options);
        return jsonResponse(
          options,
          data: successEnvelope(data: {'id': 'c1', 'status': 'available'}),
        );
      },
    );
    try {
      await DioBranchOperationsRepository(
        clientWith(fake),
      ).updateChairStatus('c1', ChairStatus.maintenance);
    } on Object {
      // The response shape is irrelevant here; only the request is asserted.
    }

    expect(route(0), 'PATCH /branch/chairs/c1/status');
  });
}
