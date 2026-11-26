import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/services/stylist_services.bloc.dart';
import 'package:stylist_app/src/features/services/stylist_services.state.dart';
import 'package:stylist_app/src/features/shared/feature_error.widget.dart';
import 'package:stylist_app/src/features/shared/load_on_init.widget.dart';

class StylistServicesScreen extends StatelessWidget {
  const StylistServicesScreen({
    super.key,
    required this.bloc,
    required this.onAdd,
    required this.onEdit,
  });

  final StylistServicesBloc bloc;
  final VoidCallback onAdd;
  final ValueChanged<String> onEdit;

  String _meta(AppLocalizations l10n, BarberServiceDto service) {
    final price = MinorUnits.toMajor(
      service.priceAmountMinor,
    ).toStringAsFixed(2);
    final currency = service.currencyCode ?? '';
    final minutes = service.durationMinutes;
    return minutes == null
        ? l10n.staffServiceMetaNoDuration(price, currency)
        : l10n.staffServiceMeta(price, currency, minutes);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: bloc.load,
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.stylistServicesEditorTitle)),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: onAdd,
          icon: const Icon(Icons.add),
          label: Text(l10n.staffServiceAdd),
        ),
        body: BlocBuilder<StylistServicesBloc, StylistServicesState>(
          bloc: bloc,
          builder: (context, state) {
            if (state.loading && state.services.isEmpty) {
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
                      fallbackMessage: l10n.commonLoadFailed,
                    ),
                  if (state.services.isEmpty && state.error == null)
                    Text(l10n.stylistServicesEditorEmpty),
                  for (final service in state.services)
                    ListTile(
                      key: ValueKey(service.id),
                      contentPadding: EdgeInsets.zero,
                      title: Text(service.name),
                      subtitle: Text(
                        '${_meta(l10n, service)} · ${service.active ? l10n.staffServiceActive : l10n.staffServiceInactive}',
                      ),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => onEdit(service.id),
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
