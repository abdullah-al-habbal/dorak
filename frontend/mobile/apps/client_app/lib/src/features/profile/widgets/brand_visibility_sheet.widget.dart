import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/profile/discovery_preferences.bloc.dart';
import 'package:client_app/src/features/profile/discovery_preferences.state.dart';

/// Lists every public brand so the client can hide or unhide it in discovery.
class BrandVisibilitySheet extends StatefulWidget {
  const BrandVisibilitySheet({super.key, required this.cubit});

  final DiscoveryPreferencesCubit cubit;

  @override
  State<BrandVisibilitySheet> createState() => _BrandVisibilitySheetState();
}

class _BrandVisibilitySheetState extends State<BrandVisibilitySheet> {
  @override
  void initState() {
    super.initState();
    widget.cubit.loadBrands();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final languageCode = Localizations.localeOf(context).languageCode;
    return BlocBuilder<DiscoveryPreferencesCubit, DiscoveryPreferencesState>(
      bloc: widget.cubit,
      builder: (context, state) {
        final hidden = state.preferences?.hiddenBrandIds ?? const <String>[];
        return ListView(
          shrinkWrap: true,
          padding: const EdgeInsets.all(DorakDimensions.marginMobile),
          children: [
            Text(l10n.brandVisibilityTitle, style: DorakTypography.titleLg),
            if (state.brandsError != null)
              StatusBanner(message: l10n.errorGeneric),
            if (state.isLoadingBrands) const AppLoader.inline(),
            if (!state.isLoadingBrands &&
                state.brandsError == null &&
                state.brands.isEmpty)
              Text(l10n.brandVisibilityEmpty, style: DorakTypography.bodyMd),
            for (final brand in state.brands)
              CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(_brandName(brand, languageCode)),
                value: hidden.contains(brand.id),
                onChanged: state.isSaving
                    ? null
                    : (_) => widget.cubit.toggleBrand(brand.id),
              ),
          ],
        );
      },
    );
  }

  String _brandName(BrandDto brand, String languageCode) =>
      brand.name[languageCode] ?? brand.name.values.firstOrNull ?? brand.id;
}
