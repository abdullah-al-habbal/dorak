import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/discovery/saved_filters.bloc.dart';
import 'package:client_app/src/features/discovery/saved_filters.state.dart';

class SavedFiltersSheet extends StatefulWidget {
  const SavedFiltersSheet({
    super.key,
    required this.cubit,
    required this.onApply,
    required this.onSaveCurrent,
  });

  final SavedFiltersCubit cubit;
  final ValueChanged<SavedFilterDto> onApply;
  final ValueChanged<String> onSaveCurrent;

  @override
  State<SavedFiltersSheet> createState() => _SavedFiltersSheetState();
}

class _SavedFiltersSheetState extends State<SavedFiltersSheet> {
  final TextEditingController _name = TextEditingController();

  @override
  void initState() {
    super.initState();
    widget.cubit.load();
  }

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Padding(
      padding: EdgeInsets.only(
        left: DorakDimensions.marginMobile,
        right: DorakDimensions.marginMobile,
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: BlocBuilder<SavedFiltersCubit, SavedFiltersState>(
        bloc: widget.cubit,
        builder: (context, state) => Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(l10n.savedFiltersTitle, style: DorakTypography.titleLg),
            if (state.error != null) StatusBanner(message: l10n.errorGeneric),
            if (state.isLoading) const AppLoader.inline(),
            if (!state.isLoading && state.filters.isEmpty)
              Text(l10n.savedFiltersEmpty, style: DorakTypography.bodyMd),
            for (final filter in state.filters)
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(filter.name),
                onTap: () => widget.onApply(filter),
                trailing: IconButton(
                  tooltip: l10n.savedFiltersDelete,
                  icon: const Icon(Icons.delete_outline),
                  onPressed: () => widget.cubit.delete(filter.id),
                ),
              ),
            TextField(
              controller: _name,
              decoration: InputDecoration(
                labelText: l10n.savedFiltersNameLabel,
              ),
            ),
            const SizedBox(height: DorakDimensions.spacingSmall),
            PrimaryButton(
              label: l10n.savedFiltersSaveCurrent,
              isLoading: state.isSaving,
              onPressed: () => widget.onSaveCurrent(_name.text),
            ),
            const SizedBox(height: DorakDimensions.spacingMedium),
          ],
        ),
      ),
    );
  }
}
