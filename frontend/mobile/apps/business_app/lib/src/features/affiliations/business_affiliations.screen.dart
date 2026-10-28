import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/affiliations/business_affiliations.bloc.dart';
import 'package:business_app/src/features/affiliations/business_affiliations.state.dart';
import 'package:business_app/src/features/affiliations/widgets/affiliation_tile.widget.dart';
import 'package:business_app/src/features/shared/feature_error.widget.dart';
import 'package:business_app/src/features/shared/load_on_init.widget.dart';

class BusinessAffiliationsScreen extends StatelessWidget {
  const BusinessAffiliationsScreen({super.key, required this.bloc});

  final BusinessAffiliationsBloc bloc;

  Widget _tile(BusinessAffiliationsState state, BarberAffiliationDto item) =>
      AffiliationTile(
        key: ValueKey(item.id),
        affiliation: item,
        busy: state.busyId == item.id,
        onAccept: () => bloc.accept(item.id),
        onReject: () => bloc.reject(item.id),
      );

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: bloc.load,
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.businessAffiliationsTitle)),
        body: BlocBuilder<BusinessAffiliationsBloc, BusinessAffiliationsState>(
          bloc: bloc,
          builder: (context, state) {
            if (state.loading && state.affiliations.isEmpty) {
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
                      fallbackMessage: l10n.businessLoadFailed,
                    ),
                  if (state.affiliations.isEmpty && state.error == null)
                    Text(l10n.businessAffiliationsEmpty),
                  if (state.pending.isNotEmpty)
                    Text(l10n.businessAffiliationsPending),
                  for (final item in state.pending) _tile(state, item),
                  if (state.others.isNotEmpty)
                    Text(l10n.businessAffiliationsOthers),
                  for (final item in state.others) _tile(state, item),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
