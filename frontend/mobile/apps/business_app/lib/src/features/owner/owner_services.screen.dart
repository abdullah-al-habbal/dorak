import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/owner/owner_error.entity.dart';
import 'package:business_app/src/features/owner/owner_services.bloc.dart';
import 'package:business_app/src/features/owner/owner_services.state.dart';
import 'package:business_app/src/features/shared/load_on_init.widget.dart';
import 'package:business_app/src/features/owner/owner_status_banner.widget.dart';

class OwnerServicesScreen extends StatelessWidget {
  const OwnerServicesScreen({
    super.key,
    required this.bloc,
    required this.onAdd,
    required this.onEdit,
    this.isReadOnly = false,
  });

  final OwnerServicesCubit bloc;
  final VoidCallback onAdd;

  /// A suspended brand can be viewed but not changed.
  final bool isReadOnly;
  final void Function(BusinessServiceDto service) onEdit;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: bloc.load,
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.ownerServicesTitle)),
        floatingActionButton: isReadOnly
            ? null
            : FloatingActionButton.extended(
                onPressed: onAdd,
                icon: const Icon(Icons.add),
                label: Text(l10n.ownerServiceAdd),
              ),
        body: BlocBuilder<OwnerServicesCubit, OwnerServicesState>(
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
                  if (isReadOnly)
                    const OwnerStatusBanner(status: OwnerBrandStatus.suspended),
                  if (state.error != null)
                    Text(OwnerError.message(l10n, state.error!)),
                  if (state.services.isEmpty && state.error == null)
                    Text(l10n.ownerServicesEmpty),
                  for (final service in state.services)
                    ListTile(
                      key: ValueKey(service.id),
                      contentPadding: EdgeInsets.zero,
                      title: Text(service.name),
                      subtitle: Text(
                        '${MinorUnits.toMajor(service.priceAmountMinor).toStringAsFixed(2)} ${service.currencyCode ?? ''}',
                      ),
                      onTap: () => onEdit(service),
                      trailing: IconButton(
                        tooltip: l10n.ownerServiceDelete,
                        icon: const Icon(Icons.delete_outline),
                        onPressed: isReadOnly
                            ? null
                            : () => bloc.delete(service.id),
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
