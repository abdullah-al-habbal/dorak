import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/schedule/stylist_schedule.bloc.dart';
import 'package:stylist_app/src/features/schedule/stylist_schedule.state.dart';
import 'package:stylist_app/src/features/schedule/widgets/schedule_day_row.widget.dart';
import 'package:stylist_app/src/features/shared/feature_error.widget.dart';
import 'package:stylist_app/src/features/shared/load_on_init.widget.dart';

class StylistScheduleScreen extends StatelessWidget {
  const StylistScheduleScreen({super.key, required this.bloc});

  final StylistScheduleBloc bloc;

  String _dayName(AppLocalizations l10n, int weekday) => switch (weekday) {
    0 => l10n.stylistWeekday0,
    1 => l10n.stylistWeekday1,
    2 => l10n.stylistWeekday2,
    3 => l10n.stylistWeekday3,
    4 => l10n.stylistWeekday4,
    5 => l10n.stylistWeekday5,
    _ => l10n.stylistWeekday6,
  };

  String? _issueText(AppLocalizations l10n, ScheduleIssue issue) =>
      switch (issue) {
        ScheduleIssue.none => null,
        ScheduleIssue.noActiveDay => l10n.stylistScheduleEmpty,
        ScheduleIssue.invalidRange => l10n.stylistScheduleInvalidRange,
      };

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: bloc.load,
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.stylistScheduleTitle)),
        body: BlocBuilder<StylistScheduleBloc, StylistScheduleState>(
          bloc: bloc,
          builder: (context, state) {
            if (state.loading && state.days.isEmpty) {
              return const Center(child: CircularProgressIndicator());
            }
            final issue = _issueText(l10n, state.issue);
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                for (final day in state.days)
                  ScheduleDayRow(
                    day: day,
                    dayName: _dayName(l10n, day.dayOfWeek),
                    onActiveChanged: (value) =>
                        bloc.setActive(day.dayOfWeek, value),
                    onStartChanged: (value) =>
                        bloc.setStart(day.dayOfWeek, value),
                    onEndChanged: (value) => bloc.setEnd(day.dayOfWeek, value),
                  ),
                if (issue != null) Text(issue),
                if (state.error != null) FeatureError(error: state.error!),
                if (state.saved) Text(l10n.commonSaved),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: state.saving ? null : bloc.save,
                  child: Text(l10n.stylistSave),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
