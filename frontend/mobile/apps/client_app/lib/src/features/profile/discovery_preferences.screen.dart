import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/profile/discovery_preferences.bloc.dart';
import 'package:client_app/src/features/profile/discovery_preferences.state.dart';
import 'package:client_app/src/features/profile/discovery_preferences_constants.entity.dart';
import 'package:client_app/src/features/profile/widgets/brand_visibility_sheet.widget.dart';
import 'package:client_app/src/core/errors/load_error_message.entity.dart';

class DiscoveryPreferencesScreen extends StatefulWidget {
  const DiscoveryPreferencesScreen({super.key, required this.cubit});

  final DiscoveryPreferencesCubit cubit;

  @override
  State<DiscoveryPreferencesScreen> createState() =>
      _DiscoveryPreferencesScreenState();
}

class _DiscoveryPreferencesScreenState
    extends State<DiscoveryPreferencesScreen> {
  double? _draftRadius;

  @override
  void initState() {
    super.initState();
    widget.cubit.load();
  }

  void _showBrandSheet() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => BrandVisibilitySheet(cubit: widget.cubit),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.discoveryPreferencesTitle),
        leading: BackButton(onPressed: () => context.pop()),
      ),
      body: BlocBuilder<DiscoveryPreferencesCubit, DiscoveryPreferencesState>(
        bloc: widget.cubit,
        builder: (context, state) {
          final preferences = state.preferences;
          if (state.isLoading) return const AppLoader.page();
          if (preferences == null) {
            return StatusView(
              icon: Icons.error_outline,
              title: l10n.errorTitleGeneric,
              message: LoadErrorMessage.of(l10n, state.error),
              actionLabel: l10n.actionRetry,
              onAction: widget.cubit.load,
            );
          }
          final radius =
              (_draftRadius ??
                      preferences.defaultRadiusKm ??
                      DiscoveryPreferencesConstants.fallbackRadius)
                  .clamp(
                    DiscoveryPreferencesConstants.minRadius,
                    DiscoveryPreferencesConstants.maxRadius,
                  );
          return ListView(
            padding: const EdgeInsets.all(DorakDimensions.marginMobile),
            children: [
              if (state.error != null) StatusBanner(message: l10n.errorGeneric),
              Text(
                l10n.discoveryPreferencesRadius(radius.round()),
                style: DorakTypography.labelLg,
              ),
              Slider(
                value: radius,
                min: DiscoveryPreferencesConstants.minRadius,
                max: DiscoveryPreferencesConstants.maxRadius,
                divisions:
                    (DiscoveryPreferencesConstants.maxRadius -
                            DiscoveryPreferencesConstants.minRadius)
                        .round(),
                onChanged: (value) => setState(() => _draftRadius = value),
                onChangeEnd: (value) {
                  setState(() => _draftRadius = null);
                  widget.cubit.save(defaultRadiusKm: value);
                },
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(l10n.discoveryPreferencesShowUnavailable),
                value: preferences.allowsUnavailableResults,
                onChanged: state.isSaving
                    ? null
                    : (value) =>
                          widget.cubit.save(allowsUnavailableResults: value),
              ),
              SecondaryButton(
                label: l10n.discoveryPreferencesChooseBrands,
                onPressed: _showBrandSheet,
              ),
              if (preferences.hiddenBrandIds.isNotEmpty) ...[
                Text(
                  l10n.discoveryPreferencesHiddenBrands(
                    preferences.hiddenBrandIds.length,
                  ),
                  style: DorakTypography.bodyMd,
                ),
                SecondaryButton(
                  label: l10n.discoveryPreferencesClearHidden,
                  onPressed: () => widget.cubit.save(hiddenBrandIds: const []),
                ),
              ],
            ],
          );
        },
      ),
    );
  }
}
