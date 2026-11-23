import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/core/navigation/app_routes.entity.dart';
import 'package:business_app/src/features/jobs/application_decision.entity.dart';
import 'package:business_app/src/features/jobs/business_job_form.screen.dart';
import 'package:business_app/src/features/jobs/business_jobs.bloc.dart';
import 'package:business_app/src/features/jobs/business_jobs.screen.dart';
import 'package:go_router/go_router.dart';

import 'helpers/business_fakes.dart';

void main() {
  late FakeJobPostingRepository repository;
  late BusinessJobsBloc bloc;

  setUp(() {
    repository = FakeJobPostingRepository();
    bloc = BusinessJobsBloc(repository);
  });

  tearDown(() => bloc.close());

  testWidgets('creating a job posting shows it in the list', (tester) async {
    final router = GoRouter(
      initialLocation: AppRoutes.jobs,
      routes: [
        GoRoute(
          path: AppRoutes.jobs,
          builder: (context, state) => BusinessJobsScreen(bloc: bloc),
        ),
        GoRoute(
          path: AppRoutes.newJob,
          builder: (context, state) => BusinessJobFormScreen(bloc: bloc),
        ),
      ],
    );
    addTearDown(router.dispose);
    await tester.pumpWidget(
      MaterialApp.router(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        routerConfig: router,
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('No job postings yet.'), findsOneWidget);

    await tester.tap(find.text('Add job posting'));
    await tester.pumpAndSettle();
    final fields = find.byType(TextFormField);
    await tester.enterText(fields.at(0), 'Senior barber');
    await tester.enterText(fields.at(1), 'حلاق');
    await tester.enterText(fields.at(2), 'Fades');
    await tester.enterText(fields.at(3), 'قص');
    await tester.tap(find.text('Save'));
    await tester.pumpAndSettle();

    expect(repository.savedValues!['title'], {
      'en': 'Senior barber',
      'ar': 'حلاق',
    });
    expect(find.text('Senior barber'), findsOneWidget);
    expect(find.text('No job postings yet.'), findsNothing);
  });

  test('opening the applicants marks them seen before listing', () async {
    await bloc.loadApplicants('job-1');

    expect(repository.markSeenCalls, 1);
    expect(bloc.state.applicants, isNotEmpty);
  });

  test('a failed mark-seen never blocks the applicant list', () async {
    repository.markSeenError = Exception('offline');

    await bloc.loadApplicants('job-1');

    expect(repository.markSeenCalls, 1);
    expect(bloc.state.loading, isFalse);
    expect(bloc.state.error, isNull);
    expect(bloc.state.applicants, isNotEmpty);
  });

  test(
    'an applicant decision updates the row with the backend status',
    () async {
      await bloc.loadApplicants('job-1');

      await bloc.decide('job-1', 'app-1', ApplicationDecision.accepted);

      expect(repository.decidedStatus, 'accepted');
      expect(bloc.state.applicants.single.status, JobApplicationStatus.accepted);
    },
  );

  test('deleting removes the posting', () async {
    repository.jobs = [
      const JobPostingDto(
        id: 'job-1',
        title: {'en': 'Barber'},
        description: {'en': 'Fade'},
        status: 'open',
        branchId: 'branch-1',
      ),
    ];
    await bloc.load();

    await bloc.delete('job-1');

    expect(repository.deletedId, 'job-1');
    expect(bloc.state.jobs, isEmpty);
  });
}
