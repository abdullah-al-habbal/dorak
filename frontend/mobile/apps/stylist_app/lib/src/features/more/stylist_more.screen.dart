import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/core/navigation/app_routes.entity.dart';

/// Everything that does not earn a bottom-navigation tab.
class StylistMoreScreen extends StatelessWidget {
  const StylistMoreScreen({
    super.key,
    required this.onNavigate,
    required this.onLocaleToggle,
    required this.onLogout,
  });

  final ValueChanged<String> onNavigate;
  final VoidCallback onLocaleToggle;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final destinations = [
      (Icons.schedule_outlined, l10n.stylistMenuSchedule, AppRoutes.schedule),
      (
        Icons.content_cut_outlined,
        l10n.stylistMenuServices,
        AppRoutes.services,
      ),
      (
        Icons.photo_library_outlined,
        l10n.stylistMenuPortfolio,
        AppRoutes.portfolio,
      ),
      (Icons.person_outline, l10n.stylistMenuProfile, AppRoutes.profile),
      (
        Icons.handshake_outlined,
        l10n.stylistMenuAffiliations,
        AppRoutes.affiliations,
      ),
      (Icons.work_outline, l10n.stylistMenuJobs, AppRoutes.jobs),
      (Icons.star_outline, l10n.stylistMenuReviews, AppRoutes.reviews),
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
          const Divider(),
          ListTile(
            leading: const Icon(Icons.language),
            title: Text(
              Localizations.localeOf(context).languageCode == 'en'
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
