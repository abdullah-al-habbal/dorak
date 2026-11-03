import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/shared/feature_error.widget.dart';
import 'package:business_app/src/features/shared/load_on_init.widget.dart';
import 'package:business_app/src/features/staff/business_staff.bloc.dart';
import 'package:business_app/src/features/staff/business_staff.state.dart';
import 'package:business_app/src/features/staff/widgets/staff_tile.widget.dart';

class BusinessStaffScreen extends StatelessWidget {
  const BusinessStaffScreen({super.key, required this.bloc});

  final BusinessStaffBloc bloc;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: bloc.load,
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.businessStaffTitle)),
        body: BlocBuilder<BusinessStaffBloc, BusinessStaffState>(
          bloc: bloc,
          builder: (context, state) {
            if (state.loading && state.staff.isEmpty) {
              return const AppLoader.page();
            }
            return RefreshIndicator(
              onRefresh: bloc.load,
              child: ListView(
                padding: const EdgeInsets.all(DorakDimensions.marginMobile),
                children: [
                  if (state.error != null)
                    FeatureError(
                      error: state.error!,
                      fallbackMessage: l10n.businessLoadFailed,
                    ),
                  if (state.staff.isEmpty && state.error == null)
                    Text(l10n.businessStaffEmpty),
                  for (final member in state.staff)
                    StaffTile(
                      key: ValueKey(member.id),
                      member: member,
                      busy: state.togglingId == member.id,
                      onToggle: () => bloc.toggle(member),
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
