import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/history/history_media_type.sheet.dart';
import 'package:stylist_app/src/features/history/stylist_client_history.bloc.dart';
import 'package:stylist_app/src/features/history/stylist_client_history.state.dart';
import 'package:stylist_app/src/features/history/widgets/history_visit_tile.widget.dart';
import 'package:stylist_app/src/features/shared/feature_error.widget.dart';
import 'package:stylist_app/src/features/shared/load_on_init.widget.dart';

class StylistClientHistoryScreen extends StatelessWidget {
  const StylistClientHistoryScreen({
    super.key,
    required this.bloc,
    required this.clientId,
  });

  final StylistClientHistoryBloc bloc;
  final String clientId;

  Future<void> _attach(BuildContext context, String historyId) async {
    final messenger = ScaffoldMessenger.of(context);
    final l10n = AppLocalizations.of(context)!;
    final type = await HistoryMediaTypeSheet.show(context);
    if (type == null) return;
    if (await bloc.attachPhoto(historyId, type)) {
      messenger.showSnackBar(
        SnackBar(content: Text(l10n.stylistHistoryPhotoAdded)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: () => bloc.load(clientId),
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.stylistClientHistoryTitle)),
        body: BlocBuilder<StylistClientHistoryBloc, StylistClientHistoryState>(
          bloc: bloc,
          builder: (context, state) {
            if (state.loading && state.visits.isEmpty) {
              return const Center(child: CircularProgressIndicator());
            }
            return RefreshIndicator(
              onRefresh: () => bloc.load(clientId),
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  if (state.error != null)
                    FeatureError(
                      error: state.error!,
                      fallbackMessage: l10n.stylistLoadFailed,
                    ),
                  if (state.visits.isEmpty && state.error == null)
                    Text(l10n.stylistClientHistoryEmpty),
                  for (final visit in state.visits)
                    HistoryVisitTile(
                      key: ValueKey(visit.id),
                      visit: visit,
                      canAttach: bloc.canAttachTo(visit),
                      uploading: state.uploadingId == visit.id,
                      onAttach: () => _attach(context, visit.id),
                      l10n: l10n,
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
