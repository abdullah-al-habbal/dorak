import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/core/navigation/app_routes.entity.dart';
import 'package:business_app/src/features/jobs/business_jobs.bloc.dart';
import 'package:business_app/src/features/jobs/business_jobs.state.dart';
import 'package:business_app/src/features/jobs/widgets/job_title.widget.dart';
import 'package:business_app/src/features/shared/feature_error.widget.dart';
import 'package:business_app/src/features/shared/load_on_init.widget.dart';

class BusinessJobsScreen extends StatelessWidget {
  const BusinessJobsScreen({super.key, required this.bloc});

  final BusinessJobsBloc bloc;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: bloc.load,
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.businessJobsTitle)),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () => context.push(AppRoutes.newJob),
          icon: const Icon(Icons.add),
          label: Text(l10n.businessJobAdd),
        ),
        body: BlocBuilder<BusinessJobsBloc, BusinessJobsState>(
          bloc: bloc,
          builder: (context, state) {
            if (state.loading && state.jobs.isEmpty) {
              return const Center(child: CircularProgressIndicator());
            }
            return RefreshIndicator(
              onRefresh: bloc.load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  if (state.error != null)
                    FeatureError(error: state.error!),
                  if (state.jobs.isEmpty && state.error == null)
                    Text(l10n.businessJobsEmpty),
                  for (final job in state.jobs)
                    ListTile(
                      key: ValueKey(job.id),
                      title: JobTitle(job: job),
                      subtitle: Text(job.status),
                      onTap: () => context.push(AppRoutes.editJob(job.id)),
                      trailing: Wrap(
                        children: [
                          IconButton(
                            tooltip: l10n.businessJobApplicants,
                            onPressed: () =>
                                context.push(AppRoutes.applicants(job.id)),
                            icon: const Icon(Icons.people_outline),
                          ),
                          IconButton(
                            tooltip: l10n.businessJobDelete,
                            onPressed: state.busyId != null
                                ? null
                                : () => bloc.delete(job.id),
                            icon: const Icon(Icons.delete_outline),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
