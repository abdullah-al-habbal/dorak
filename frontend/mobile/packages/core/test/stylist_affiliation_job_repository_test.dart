import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

const _affiliation = {
  'id': 'a1',
  'barber_id': 'b1',
  'affiliable_id': 'br1',
  'affiliable_type': 'branch',
  'status': 'pending',
};

const _job = {
  'id': 'j1',
  'title': {'en': 'Barber'},
  'description': {'en': 'Fade'},
  'status': 'open',
  'branch_id': 'br1',
};

const _application = {
  'id': 'app1',
  'job_posting_id': 'j1',
  'barber_id': 'b1',
  'status': 'submitted',
};

void main() {
  late List<RequestOptions> requests;
  late ApiClient client;

  setUp(() {
    requests = [];
    final fake = fakeDio(
      handler: (options) {
        requests.add(options);
        final path = options.path;
        final isList =
            options.method == 'GET' && !path.endsWith('/j1') ||
            path.endsWith('/affiliations');
        final item = path.contains('affiliat')
            ? _affiliation
            : path.contains('apply') || path == '/applications'
            ? _application
            : _job;
        return jsonResponse(
          options,
          data: successEnvelope(data: isList ? [item] : item),
        );
      },
    );
    client = clientWith(fake);
  });

  test('barber affiliation calls map to the barber routes', () async {
    final repository = DioAffiliationRepository(client);

    await repository.createAffiliation(
      'b1',
      affiliableId: 'br1',
      affiliableType: 'branch',
    );
    await repository.getBarberAffiliations('b1');
    await repository.acceptAffiliation('a1');
    await repository.rejectAffiliation('a1');

    expect(requests.map((r) => '${r.method} ${r.path}'), [
      'POST /barbers/b1/affiliate',
      'GET /barbers/b1/affiliations',
      'POST /affiliations/a1/accept',
      'POST /affiliations/a1/reject',
    ]);
  });

  test('job calls map to the barber-facing routes only', () async {
    final repository = DioJobPostingRepository(client);

    await repository.getJob('j1');
    await repository.apply('j1');
    await repository.getApplications();

    expect(requests.map((r) => '${r.method} ${r.path}'), [
      'GET /jobs/j1',
      'POST /jobs/j1/apply',
      'GET /applications',
    ]);
  });
}
