import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/core/navigation/app_routes.entity.dart';
import 'package:business_app/src/core/locale/app_locales.entity.dart';

/// Everything that does not earn a bottom-navigation tab.
class BusinessMoreScreen extends StatelessWidget {
  const BusinessMoreScreen({
    super.key,
    required this.onNavigate,
    required this.onAddBarber,
    required this.onLocaleToggle,
    required this.onLogout,
  });

  final ValueChanged<String> onNavigate;
  final VoidCallback onAddBarber;
  final VoidCallback onLocaleToggle;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final destinations = [
      (Icons.schedule_outlined, l10n.businessMenuHours, AppRoutes.hours),
      (Icons.payments_outlined, l10n.businessMenuEarnings, AppRoutes.earnings),
      (Icons.work_outline, l10n.businessMenuJobs, AppRoutes.jobs),
      (
        Icons.grid_view_outlined,
        l10n.businessMenuFloorPlan,
        AppRoutes.floorPlan,
      ),
      (
        Icons.handshake_outlined,
        l10n.businessMenuAffiliations,
        AppRoutes.affiliations,
      ),
      (Icons.storefront_outlined, l10n.businessMenuProfile, AppRoutes.profile),
      (Icons.star_outline, l10n.businessMenuReviews, AppRoutes.reviews),
      (Icons.info_outline, l10n.aboutLegalTitle, AppRoutes.about),
    ];
    return Scaffold(
      appBar: AppBar(title: Text(l10n.staffMoreTitle)),
      body: ListView(
        children: [
          for (final (icon, label, route) in destinations)
            ListTile(
              leading: Icon(icon),
              title: Text(label),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => onNavigate(route),
            ),
          ListTile(
            leading: const Icon(Icons.person_add_alt_1_outlined),
            title: Text(l10n.managerManualBarberTitle),
            onTap: onAddBarber,
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.language),
            title: Text(
              Localizations.localeOf(context).languageCode ==
                      AppLocales.englishCode
                  ? l10n.localeArabic
                  : l10n.localeEnglish,
            ),
            onTap: onLocaleToggle,
          ),
          ListTile(
            leading: const Icon(Icons.logout),
            title: Text(l10n.staffLogOut),
            onTap: onLogout,
          ),
        ],
      ),
    );
  }
}
