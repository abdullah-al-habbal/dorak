import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/jobs/stylist_jobs.bloc.dart';
import 'package:stylist_app/src/features/jobs/stylist_jobs.state.dart';
import 'package:stylist_app/src/features/jobs/widgets/job_title.widget.dart';
import 'package:stylist_app/src/features/shared/load_on_init.widget.dart';

class StylistApplicationsScreen extends StatelessWidget {
  const StylistApplicationsScreen({super.key, required this.bloc});

  final StylistJobsBloc bloc;

  String _statusLabel(AppLocalizations l10n, JobApplicationStatus status) =>
      switch (status) {
        JobApplicationStatus.seen => l10n.stylistApplicationStatusSeen,
        JobApplicationStatus.accepted => l10n.stylistApplicationStatusAccepted,
        JobApplicationStatus.rejected => l10n.stylistApplicationStatusRejected,
        JobApplicationStatus.submitted ||
        JobApplicationStatus.unknown => l10n.stylistApplicationStatusSubmitted,
      };

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: bloc.load,
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.stylistMyApplications)),
        body: BlocBuilder<StylistJobsBloc, StylistJobsState>(
          bloc: bloc,
          builder: (context, state) {
            if (state.loading && state.applications.isEmpty) {
              return const Center(child: CircularProgressIndicator());
            }
            if (state.applications.isEmpty) {
              return Center(child: Text(l10n.stylistApplicationsEmpty));
            }
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                for (final application in state.applications)
                  ListTile(
                    key: ValueKey(application.id),
                    title: _title(state, application.jobPostingId),
                    subtitle: Text(_statusLabel(l10n, application.status)),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _title(StylistJobsState state, String jobId) {
    final job = state.jobById(jobId);
    return job == null ? Text(jobId) : JobTitle(job: job);
  }
}
