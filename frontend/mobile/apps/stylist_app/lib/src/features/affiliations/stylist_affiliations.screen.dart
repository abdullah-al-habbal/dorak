import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/affiliations/stylist_affiliations.bloc.dart';
import 'package:stylist_app/src/features/affiliations/stylist_affiliations.state.dart';
import 'package:stylist_app/src/features/affiliations/widgets/affiliation_tile.widget.dart';
import 'package:stylist_app/src/features/shared/feature_error.widget.dart';
import 'package:stylist_app/src/features/shared/load_on_init.widget.dart';

class StylistAffiliationsScreen extends StatelessWidget {
  const StylistAffiliationsScreen({super.key, required this.bloc});

  final StylistAffiliationsBloc bloc;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: bloc.load,
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.stylistAffiliationsTitle)),
        body: BlocBuilder<StylistAffiliationsBloc, StylistAffiliationsState>(
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
                      fallbackMessage: l10n.commonLoadFailed,
                    ),
                  if (state.affiliations.isEmpty && state.error == null)
                    Text(l10n.stylistAffiliationsEmpty),
                  for (final BarberAffiliationDto affiliation
                      in state.affiliations)
                    AffiliationTile(
                      key: ValueKey(affiliation.id),
                      affiliation: affiliation,
                      busy: state.busyId == affiliation.id,
                      onAccept: () => bloc.accept(affiliation.id),
                      onReject: () => bloc.reject(affiliation.id),
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
