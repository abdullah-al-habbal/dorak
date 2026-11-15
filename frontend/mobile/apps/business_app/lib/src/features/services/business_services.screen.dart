import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/services/business_services.bloc.dart';
import 'package:business_app/src/features/services/business_services.state.dart';
import 'package:business_app/src/features/shared/feature_error.widget.dart';
import 'package:business_app/src/features/shared/load_on_init.widget.dart';

/// Read-only: brand services are written by the brand owner and the platform admin (F-07).
class BusinessServicesScreen extends StatelessWidget {
  const BusinessServicesScreen({
    super.key,
    required this.bloc,
  });

  final BusinessServicesBloc bloc;

  String _meta(AppLocalizations l10n, BusinessServiceDto service) {
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
        appBar: AppBar(title: Text(l10n.businessServicesTitle)),
        body: BlocBuilder<BusinessServicesBloc, BusinessServicesState>(
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
                      fallbackMessage: l10n.businessLoadFailed,
                    ),
                  if (state.services.isEmpty && state.error == null)
                    Text(l10n.businessServicesEmpty),
                  for (final service in state.services)
                    ListTile(
                      key: ValueKey(service.id),
                      contentPadding: EdgeInsets.zero,
                      title: Text(service.name),
                      subtitle: Text(
                        '${_meta(l10n, service)} · ${service.isActive ? l10n.staffServiceActive : l10n.staffServiceInactive}',
                      ),
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
