import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/owner/owner_branches.bloc.dart';
import 'package:business_app/src/features/owner/owner_branches.state.dart';
import 'package:business_app/src/features/owner/owner_error.entity.dart';
import 'package:business_app/src/features/shared/load_on_init.widget.dart';

class OwnerBranchesScreen extends StatelessWidget {
  const OwnerBranchesScreen({
    super.key,
    required this.bloc,
    required this.onAdd,
    required this.onEdit,
  });

  final OwnerBranchesCubit bloc;
  final VoidCallback onAdd;
  final void Function(String id) onEdit;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final language = Localizations.localeOf(context).languageCode;
    return LoadOnInit(
      onInit: bloc.load,
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.ownerBranchesTitle)),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: onAdd,
          icon: const Icon(Icons.add),
          label: Text(l10n.ownerBranchAdd),
        ),
        body: BlocBuilder<OwnerBranchesCubit, OwnerBranchesState>(
          bloc: bloc,
          builder: (context, state) {
            if (state.loading && state.branches.isEmpty) {
              return const AppLoader.page();
            }
            return RefreshIndicator(
              onRefresh: bloc.load,
              child: ListView(
                padding: const EdgeInsets.all(DorakDimensions.marginMobile),
                children: [
                  if (state.error != null)
                    Text(OwnerError.message(l10n, state.error!)),
                  if (state.branches.isEmpty && state.error == null)
                    Text(l10n.ownerBranchesEmpty),
                  for (final OwnerBranchDto branch in state.branches)
                    ListTile(
                      key: ValueKey(branch.id),
                      contentPadding: EdgeInsets.zero,
                      title: Text(
                        branch.name[language] ??
                            branch.name.values.firstOrNull ??
                            '',
                      ),
                      subtitle: Text(branch.email ?? ''),
                      onTap: () => onEdit(branch.id),
                      trailing: Semantics(
                        label: branch.isEnabled
                            ? l10n.ownerBranchOn
                            : l10n.ownerBranchOff,
                        child: Switch(
                          value: branch.isEnabled,
                          onChanged: (on) =>
                              bloc.switchBranch(branch.id, on: on),
                        ),
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
