import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:stylist_app/src/features/jobs/stylist_jobs.bloc.dart';

import 'helpers/stylist_fakes.dart';

class _FailingApplicationsRepository extends FakeJobPostingRepository {
  _FailingApplicationsRepository(this.failure);

  final Object failure;

  @override
  Future<PaginatedData<JobApplicationDto>> getApplications({String? status}) =>
      Future.error(failure);
}

void main() {
  late FakeJobPostingRepository repository;
  late StylistJobsBloc bloc;

  setUp(() async {
    repository = FakeJobPostingRepository();
    bloc = StylistJobsBloc(repository);
    await bloc.load();
  });

  tearDown(() => bloc.close());

  test(
    'applying twice surfaces the backend error without duplicating',
    () async {
      const rejected = ApiException(
        statusCode: 422,
        code: 'UNPROCESSABLE_ENTITY',
        message: 'jobposting::messages.already_applied',
      );
      repository.secondApplyError = rejected;

      await bloc.apply('job-1');
      await bloc.apply('job-1');

      expect(bloc.state.applications, hasLength(1));
      expect(bloc.state.hasApplied('job-1'), isTrue);
      expect(bloc.state.error, rejected);
      expect(bloc.state.applyingJobId, isNull);
    },
  );

  test(
    'one failed request keeps the original error and clears loading',
    () async {
      const failure = ApiException(
        statusCode: 500,
        code: 'SERVER_ERROR',
        message: 'applications unavailable',
      );
      final failing = StylistJobsBloc(_FailingApplicationsRepository(failure));

      await failing.load();

      expect(failing.state.error, same(failure));
      expect(failing.state.loading, isFalse);
      expect(failing.state.jobs, isEmpty);
      await failing.close();
    },
  );
}
