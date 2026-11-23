import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/jobs/application_decision.entity.dart';
import 'package:business_app/src/features/jobs/business_jobs.bloc.dart';
import 'package:business_app/src/features/jobs/business_jobs.state.dart';
import 'package:business_app/src/features/shared/feature_error.widget.dart';
import 'package:business_app/src/features/shared/load_on_init.widget.dart';

class BusinessApplicantsScreen extends StatelessWidget {
  const BusinessApplicantsScreen({
    super.key,
    required this.bloc,
    required this.jobId,
  });

  final BusinessJobsBloc bloc;
  final String jobId;

  String _statusLabel(AppLocalizations l10n, JobApplicationStatus status) =>
      switch (status) {
        JobApplicationStatus.seen => l10n.businessApplicationStatusSeen,
        JobApplicationStatus.accepted => l10n.businessApplicationStatusAccepted,
        JobApplicationStatus.rejected => l10n.businessApplicationStatusRejected,
        JobApplicationStatus.submitted ||
        JobApplicationStatus.unknown => l10n.businessApplicationStatusSubmitted,
      };

  bool _decided(JobApplicationDto application) => application.status.isDecided;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: () => bloc.loadApplicants(jobId),
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.businessJobApplicants)),
        body: BlocBuilder<BusinessJobsBloc, BusinessJobsState>(
          bloc: bloc,
          builder: (context, state) {
            if (state.loading && state.applicants.isEmpty) {
              return const Center(child: CircularProgressIndicator());
            }
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (state.error != null) FeatureError(error: state.error!),
                if (state.applicants.isEmpty && state.error == null)
                  Text(l10n.businessApplicantsEmpty),
                for (final application in state.applicants)
                  Card(
                    key: ValueKey(application.id),
                    child: ListTile(
                      title: Text(
                        application.profileSnapshot?.name ??
                            application.barberId,
                      ),
                      subtitle: Text(_statusLabel(l10n, application.status)),
                      trailing: _decided(application)
                          ? null
                          : Wrap(
                              children: [
                                TextButton(
                                  onPressed: state.busyId != null
                                      ? null
                                      : () => bloc.decide(
                                          jobId,
                                          application.id,
                                          ApplicationDecision.accepted,
                                        ),
                                  child: Text(l10n.businessApplicantAccept),
                                ),
                                TextButton(
                                  onPressed: state.busyId != null
                                      ? null
                                      : () => bloc.decide(
                                          jobId,
                                          application.id,
                                          ApplicationDecision.rejected,
                                        ),
                                  child: Text(l10n.businessApplicantReject),
                                ),
                              ],
                            ),
                    ),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }
}
