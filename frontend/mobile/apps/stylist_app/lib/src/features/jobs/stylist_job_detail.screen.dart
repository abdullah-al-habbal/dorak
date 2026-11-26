import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/jobs/stylist_jobs.bloc.dart';
import 'package:stylist_app/src/features/jobs/stylist_jobs.state.dart';
import 'package:stylist_app/src/features/jobs/widgets/job_title.widget.dart';
import 'package:stylist_app/src/features/shared/feature_error.widget.dart';
import 'package:stylist_app/src/features/shared/load_on_init.widget.dart';

class StylistJobDetailScreen extends StatelessWidget {
  const StylistJobDetailScreen({
    super.key,
    required this.bloc,
    required this.jobId,
  });

  final StylistJobsBloc bloc;
  final String jobId;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final localeCode = Localizations.localeOf(context).languageCode;
    return LoadOnInit(
      onInit: () => bloc.loadJob(jobId),
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.stylistJobsTitle)),
        body: BlocBuilder<StylistJobsBloc, StylistJobsState>(
          bloc: bloc,
          builder: (context, state) {
            final job = state.jobById(jobId);
            if (job == null) {
              return state.error == null
                  ? const Center(child: CircularProgressIndicator())
                  : FeatureError(
                      error: state.error!,
                      fallbackMessage: l10n.commonLoadFailed,
                    );
            }
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                JobTitle(job: job),
                const SizedBox(height: 8),
                Text(
                  LocalizedName.resolve(
                    job.description.map(
                      (key, value) => MapEntry(key, '$value'),
                    ),
                    localeCode,
                  ),
                ),
                if (state.error != null)
                  FeatureError(
                    error: state.error!,
                    fallbackMessage: l10n.stylistJobApplyRejected,
                  ),
                if (state.hasApplied(jobId)) Text(l10n.stylistJobApplied),
                FilledButton(
                  onPressed:
                      state.applyingJobId != null || state.hasApplied(jobId)
                      ? null
                      : () => bloc.apply(jobId),
                  child: Text(l10n.stylistJobApply),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
