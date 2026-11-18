import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/core/locale/app_locales.entity.dart';
import 'package:business_app/src/core/navigation/app_routes.entity.dart';
import 'package:business_app/src/features/owner/owner_error.entity.dart';
import 'package:business_app/src/features/owner/owner_home.bloc.dart';
import 'package:business_app/src/features/owner/owner_home.state.dart';
import 'package:business_app/src/features/owner/owner_status_banner.widget.dart';
import 'package:business_app/src/features/shared/load_on_init.widget.dart';

/// The owner's landing screen: the brand, its approval banner and the entries to
/// branches, services, plan and payouts.
class OwnerHomeScreen extends StatelessWidget {
  const OwnerHomeScreen({
    super.key,
    required this.bloc,
    required this.onNavigate,
    required this.onLocaleToggle,
    required this.onLogout,
    required this.onRegister,
  });

  final OwnerHomeCubit bloc;
  final void Function(String route) onNavigate;
  final VoidCallback onLocaleToggle;
  final VoidCallback onLogout;
  final VoidCallback onRegister;

  String _statusLabel(AppLocalizations l10n, OwnerBrandStatus status) =>
      switch (status) {
        OwnerBrandStatus.active => l10n.ownerBrandActive,
        OwnerBrandStatus.pending => l10n.ownerBrandPending,
        OwnerBrandStatus.rejected => l10n.ownerBrandRejected,
        OwnerBrandStatus.suspended => l10n.ownerBrandSuspended,
        OwnerBrandStatus.unknown => '',
      };

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final language = Localizations.localeOf(context).languageCode;
    return LoadOnInit(
      onInit: bloc.load,
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.ownerHomeTitle)),
        body: BlocConsumer<OwnerHomeCubit, OwnerHomeState>(
          bloc: bloc,
          listenWhen: (previous, current) =>
              !previous.resubmitted && current.resubmitted,
          listener: (context, state) => ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(l10n.ownerResubmitted))),
          builder: (context, state) => switch (state.status) {
            OwnerHomeStatus.loading => const AppLoader.page(),
            OwnerHomeStatus.failed => ListView(
              padding: const EdgeInsets.all(DorakDimensions.marginMobile),
              children: [
                Text(OwnerError.message(l10n, state.error!)),
                const SizedBox(height: DorakDimensions.spacingMedium),
                SecondaryButton(
                  label: l10n.businessRetry,
                  onPressed: bloc.load,
                ),
                ..._account(l10n),
              ],
            ),
            OwnerHomeStatus.noBrand => ListView(
              padding: const EdgeInsets.all(DorakDimensions.marginMobile),
              children: [
                Text(l10n.ownerNoBrandTitle, style: DorakTypography.titleLg),
                const SizedBox(height: DorakDimensions.spacingSmall),
                Text(l10n.ownerNoBrandBody),
                const SizedBox(height: DorakDimensions.spacingMedium),
                PrimaryButton(
                  label: l10n.ownerRegisterLink,
                  onPressed: onRegister,
                ),
                ..._account(l10n),
              ],
            ),
            OwnerHomeStatus.ready => ListView(
              padding: const EdgeInsets.all(DorakDimensions.marginMobile),
              children: [
                OwnerStatusBanner(
                  status: state.brandStatus,
                  reason: state.brand?.statusReason,
                  isResubmitting: state.isResubmitting,
                  onResubmit: state.brand?.canResubmit == true
                      ? bloc.resubmit
                      : null,
                ),
                if (state.actionError != null)
                  Padding(
                    padding: const EdgeInsets.only(
                      top: DorakDimensions.spacingSmall,
                    ),
                    child: Text(OwnerError.message(l10n, state.actionError!)),
                  ),
                const SizedBox(height: DorakDimensions.spacingMedium),
                Text(
                  state.brand!.name[language] ??
                      state.brand!.name.values.firstOrNull ??
                      '',
                  style: DorakTypography.titleLg,
                ),
                Text(_statusLabel(l10n, state.brandStatus)),
                const SizedBox(height: DorakDimensions.spacingMedium),
                ListTile(
                  leading: const Icon(Icons.storefront_outlined),
                  title: Text(l10n.ownerMenuBranches),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => onNavigate(AppRoutes.ownerBranches),
                ),
                ListTile(
                  leading: const Icon(Icons.content_cut),
                  title: Text(l10n.ownerMenuServices),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => onNavigate(AppRoutes.ownerServices),
                ),
                ListTile(
                  leading: const Icon(Icons.payments_outlined),
                  title: Text(l10n.ownerMenuBilling),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => onNavigate(AppRoutes.ownerBilling),
                ),
                ..._account(l10n),
              ],
            ),
          },
        ),
      ),
    );
  }

  List<Widget> _account(AppLocalizations l10n) => [
    const Divider(),
    ListTile(
      leading: const Icon(Icons.info_outline),
      title: Text(l10n.aboutLegalTitle),
      onTap: () => onNavigate(AppRoutes.about),
    ),
    Builder(
      builder: (context) => ListTile(
        leading: const Icon(Icons.language),
        title: Text(
          Localizations.localeOf(context).languageCode == AppLocales.englishCode
              ? l10n.localeArabic
              : l10n.localeEnglish,
        ),
        onTap: onLocaleToggle,
      ),
    ),
    ListTile(
      leading: const Icon(Icons.logout),
      title: Text(l10n.staffLogOut),
      onTap: onLogout,
    ),
  ];
}
