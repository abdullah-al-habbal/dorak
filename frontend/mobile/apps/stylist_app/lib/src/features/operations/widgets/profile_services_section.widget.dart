import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class ProfileServicesSection extends StatelessWidget {
  const ProfileServicesSection({
    super.key,
    required this.profile,
    required this.l10n,
  });

  final BarberProfileDto profile;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      ListTile(
        contentPadding: EdgeInsets.zero,
        title: Text(profile.name),
        subtitle: Text(profile.email),
      ),
      Text(l10n.stylistServicesTitle, style: DorakTypography.titleLg),
      if (profile.services.isEmpty) Text(l10n.stylistNoServicesMessage),
      ...profile.services.where((service) => service.active).map(
        (service) => ListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(service.name),
          subtitle: Text(
            [
              if (service.duration != null)
                l10n.serviceDurationLabel(service.duration!),
              if (service.isAtHome) l10n.serviceAtHomeLabel,
            ].join(' · '),
          ),
        ),
      ),
    ],
  );
}
