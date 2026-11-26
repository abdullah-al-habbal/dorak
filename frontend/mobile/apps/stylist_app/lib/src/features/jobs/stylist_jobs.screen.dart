import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/core/navigation/app_routes.entity.dart';
import 'package:stylist_app/src/features/jobs/stylist_jobs.bloc.dart';
import 'package:stylist_app/src/features/jobs/stylist_jobs.state.dart';
import 'package:stylist_app/src/features/jobs/widgets/job_title.widget.dart';
import 'package:stylist_app/src/features/shared/feature_error.widget.dart';
import 'package:stylist_app/src/features/shared/load_on_init.widget.dart';

class StylistJobsScreen extends StatelessWidget {
  const StylistJobsScreen({super.key, required this.bloc});

  final StylistJobsBloc bloc;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: bloc.load,
      child: Scaffold(
        appBar: AppBar(
          title: Text(l10n.stylistJobsTitle),
          actions: [
            TextButton(
              onPressed: () => context.push(AppRoutes.applications),
              child: Text(l10n.stylistMyApplications),
            ),
          ],
        ),
        body: BlocBuilder<StylistJobsBloc, StylistJobsState>(
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
                    FeatureError(
                      error: state.error!,
                      fallbackMessage: l10n.commonLoadFailed,
                    ),
                  if (state.jobs.isEmpty && state.error == null)
                    Text(l10n.stylistJobsEmpty),
                  for (final job in state.jobs)
                    ListTile(
                      key: ValueKey(job.id),
                      title: JobTitle(job: job),
                      trailing: state.hasApplied(job.id)
                          ? const Icon(Icons.check)
                          : null,
                      onTap: () => context.push(AppRoutes.job(job.id)),
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
