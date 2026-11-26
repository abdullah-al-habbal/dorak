import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/hours/business_hours.bloc.dart';
import 'package:business_app/src/features/hours/business_hours.state.dart';
import 'package:business_app/src/features/hours/widgets/hours_day_row.widget.dart';
import 'package:business_app/src/features/shared/feature_error.widget.dart';
import 'package:business_app/src/features/shared/load_on_init.widget.dart';
import 'package:business_app/src/features/hours/hours_issue.entity.dart';

class BusinessHoursScreen extends StatelessWidget {
  const BusinessHoursScreen({super.key, required this.bloc});

  final BusinessHoursBloc bloc;

  String _dayName(AppLocalizations l10n, int weekday) => switch (weekday) {
    0 => l10n.stylistWeekday0,
    1 => l10n.stylistWeekday1,
    2 => l10n.stylistWeekday2,
    3 => l10n.stylistWeekday3,
    4 => l10n.stylistWeekday4,
    5 => l10n.stylistWeekday5,
    _ => l10n.stylistWeekday6,
  };

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: bloc.load,
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.businessHoursTitle)),
        body: BlocBuilder<BusinessHoursBloc, BusinessHoursState>(
          bloc: bloc,
          builder: (context, state) {
            if (state.loading && state.days.isEmpty) {
              return const AppLoader.page();
            }
            return ListView(
              padding: const EdgeInsets.all(DorakDimensions.marginMobile),
              children: [
                for (final day in state.days)
                  HoursDayRow(
                    key: ValueKey(day.dayOfWeek),
                    day: day,
                    dayName: _dayName(l10n, day.dayOfWeek),
                    onClosedChanged: (value) =>
                        bloc.setClosed(day.dayOfWeek, value),
                    onOpensChanged: (value) =>
                        bloc.setOpens(day.dayOfWeek, value),
                    onClosesChanged: (value) =>
                        bloc.setCloses(day.dayOfWeek, value),
                  ),
                if (state.issue == HoursIssue.invalidRange)
                  Text(l10n.businessHoursInvalidRange),
                if (state.error != null) FeatureError(error: state.error!),
                if (state.saved) Text(l10n.commonSaved),
                const SizedBox(height: DorakDimensions.spacingMedium),
                FilledButton(
                  onPressed: state.saving ? null : bloc.save,
                  child: Text(l10n.businessSave),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
