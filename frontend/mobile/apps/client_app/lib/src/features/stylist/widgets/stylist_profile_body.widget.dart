import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/stylist/stylist_profile.bloc.dart';
import 'package:client_app/src/features/stylist/stylist_profile.state.dart';
import 'package:client_app/src/features/stylist/widgets/stylist_header.widget.dart';
import 'package:client_app/src/features/stylist/widgets/stylist_services.widget.dart';
import 'package:client_app/src/features/stylist/widgets/stylist_stats.widget.dart';
import 'package:client_app/src/features/stylist/widgets/stylist_workplaces.widget.dart';

class StylistProfileBody extends StatelessWidget {
  const StylistProfileBody({super.key, required this.bloc, required this.state});

  final StylistProfileBloc bloc;
  final StylistProfileState state;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    final localeCode = Localizations.localeOf(context).languageCode;
    final profile = state.profile!;
    return ListView(
      padding: const EdgeInsets.all(DorakDimensions.marginMobile),
      children: [
        StylistHeader(profile: profile, colors: colors, l10n: l10n),
        if (profile.bio != null && profile.bio!.isNotEmpty) ...[
          const SizedBox(height: DorakDimensions.spacingMedium),
          Text(
            profile.bio!,
            style: DorakTypography.bodyMd.copyWith(color: colors.onSurface),
          ),
        ],
        const SizedBox(height: DorakDimensions.spacingLarge),
        if (profile.workplaces.isNotEmpty) ...[
          StylistWorkplaces(workplaces: profile.workplaces),
          const SizedBox(height: DorakDimensions.spacingLarge),
        ],
        StylistStats(profile: profile, colors: colors, l10n: l10n),
        const SizedBox(height: DorakDimensions.spacingLarge),
        StylistServices(
          profile: profile,
          currencies: state.currencies,
          colors: colors,
          l10n: l10n,
          localeCode: localeCode,
        ),
      ],
    );
  }
}
