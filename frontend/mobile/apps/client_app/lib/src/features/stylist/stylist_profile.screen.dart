import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';

import 'package:client_app/src/features/stylist/widgets/stylist_workplaces.widget.dart';
import 'package:client_app/src/core/formatting/rating_label.entity.dart';
import 'package:client_app/src/core/formatting/locale_formatters.entity.dart';
import 'package:client_app/src/features/stylist/stylist_profile.bloc.dart';
import 'package:client_app/src/features/stylist/stylist_profile.event.dart';
import 'package:client_app/src/features/stylist/stylist_profile.state.dart';
import 'package:client_app/src/features/stylist/models/stylist_stat_item.entity.dart';

class StylistProfileScreen extends StatefulWidget {
  const StylistProfileScreen({
    super.key,
    required this.bloc,
    required this.barberId,
    required this.onLocaleToggle,
  });

  final StylistProfileBloc bloc;
  final String barberId;
  final VoidCallback onLocaleToggle;

  @override
  State<StylistProfileScreen> createState() => _StylistProfileScreenState();
}

class _StylistProfileScreenState extends State<StylistProfileScreen> {
  @override
  void initState() {
    super.initState();
    widget.bloc.add(StylistProfileStarted(widget.barberId));
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    return Scaffold(
      appBar: AppBar(
        title: BlocBuilder<StylistProfileBloc, StylistProfileState>(
          bloc: widget.bloc,
          buildWhen: (previous, current) =>
              previous.profile?.name != current.profile?.name,
          builder: (context, state) => Text(state.profile?.name ?? ''),
        ),
        actions: [
          LocaleSwitcher(
            label: isArabic ? l10n.localeEnglish : l10n.localeArabic,
            onPressed: widget.onLocaleToggle,
          ),
        ],
      ),
      body: BlocBuilder<StylistProfileBloc, StylistProfileState>(
        bloc: widget.bloc,
        builder: (context, state) {
          if (state.error != null && state.profile == null) {
            return StatusView(
              icon: Icons.error_outline,
              title: l10n.errorTitleGeneric,
              message: l10n.errorNetwork,
              actionLabel: l10n.actionRetry,
              onAction: () => widget.bloc.add(const StylistProfileRetried()),
            );
          }
          if (state.isLoading || state.profile == null) {
            return const AppLoader.page();
          }
          return _StylistProfileBody(bloc: widget.bloc, state: state);
        },
      ),
    );
  }
}

class _StylistProfileBody extends StatelessWidget {
  const _StylistProfileBody({required this.bloc, required this.state});

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
        _StylistHeader(profile: profile, colors: colors, l10n: l10n),
        const SizedBox(height: DorakDimensions.spacingLarge),
        if (profile.workplaces.isNotEmpty) ...[
          StylistWorkplaces(workplaces: profile.workplaces),
          const SizedBox(height: DorakDimensions.spacingLarge),
        ],
        _StylistStats(profile: profile, colors: colors, l10n: l10n),
        const SizedBox(height: DorakDimensions.spacingLarge),
        _StylistServices(
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

class _StylistHeader extends StatelessWidget {
  const _StylistHeader({
    required this.profile,
    required this.colors,
    required this.l10n,
  });

  final BarberProfileDto profile;
  final DorakColors colors;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        CircleAvatar(
          radius: 40,
          backgroundColor: colors.surfaceContainerHigh,
          child: Text(
            profile.name.characters.firstOrNull ?? '?',
            style: DorakTypography.headlineLgMobile.copyWith(
              color: colors.onSurface,
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                profile.name,
                style: DorakTypography.headlineLgMobile.copyWith(
                  color: colors.onSurface,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                RatingLabel.of(
                  l10n,
                  average: profile.ratingAvg,
                  count: profile.ratingCount,
                  localeCode: l10n.localeName,
                ),
                style: DorakTypography.bodyMd.copyWith(color: colors.primary),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  if (profile.rank != null) ...[
                    Text(
                      l10n.discoverRankBadge(profile.rank!),
                      style: DorakTypography.bodyMd.copyWith(
                        color: colors.primary,
                      ),
                    ),
                    const SizedBox(width: 12),
                  ],
                  if (profile.compatibilityScore != null)
                    Text(
                      l10n
                          .discoverCompatibilityBadge(
                            (profile.compatibilityScore! * 100).round(),
                          )
                          .toString(),
                      style: DorakTypography.bodyMd.copyWith(
                        color: colors.primary,
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _StylistStats extends StatelessWidget {
  const _StylistStats({
    required this.profile,
    required this.colors,
    required this.l10n,
  });

  final BarberProfileDto profile;
  final DorakColors colors;
  final AppLocalizations l10n;

  List<StylistStatItem> get _stats {
    final stats = <StylistStatItem>[
      StylistStatItem(
        value: '${profile.services.length}',
        label: l10n.stylistStatServicesLabel,
      ),
    ];
    if (profile.rank != null) {
      stats.add(
        StylistStatItem(
          value: l10n.discoverRankBadge(profile.rank!),
          label: l10n.stylistStatRankLabel,
        ),
      );
    }
    if (profile.compatibilityScore != null) {
      stats.add(
        StylistStatItem(
          value: l10n
              .discoverCompatibilityBadge(
                (profile.compatibilityScore! * 100).round(),
              )
              .toString(),
          label: l10n.stylistStatCompatibilityLabel,
        ),
      );
    }
    return stats;
  }

  @override
  Widget build(BuildContext context) {
    final stats = _stats;
    if (stats.isEmpty) return const SizedBox.shrink();
    return Row(
      children: [
        for (var i = 0; i < stats.length; i++) ...[
          if (i > 0) const SizedBox(width: DorakDimensions.spacingLarge),
          Expanded(
            child: Column(
              children: [
                Text(
                  stats[i].value,
                  style: DorakTypography.titleLg.copyWith(
                    color: colors.primary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  stats[i].label,
                  style: DorakTypography.bodyMd.copyWith(
                    color: colors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

class _StylistServices extends StatelessWidget {
  const _StylistServices({
    required this.profile,
    required this.currencies,
    required this.colors,
    required this.l10n,
    required this.localeCode,
  });

  final BarberProfileDto profile;
  final List<CurrencyDto> currencies;
  final DorakColors colors;
  final AppLocalizations l10n;
  final String localeCode;

  @override
  Widget build(BuildContext context) {
    if (profile.services.isEmpty) {
      return Text(
        l10n.stylistNoServicesMessage,
        style: DorakTypography.bodyMd.copyWith(color: colors.onSurfaceVariant),
      );
    }
    final currencyById = <String, CurrencyDto>{
      for (final currency in currencies) currency.id: currency,
    };
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(l10n.stylistServicesTitle, style: DorakTypography.titleLg),
        const SizedBox(height: DorakDimensions.spacingSmall),
        ...profile.services.map(
          (service) => _StylistServiceCard(
            service: service,
            currencyById: currencyById,
            colors: colors,
            l10n: l10n,
            localeCode: localeCode,
          ),
        ),
      ],
    );
  }
}

class _StylistServiceCard extends StatelessWidget {
  const _StylistServiceCard({
    required this.service,
    required this.currencyById,
    required this.colors,
    required this.l10n,
    required this.localeCode,
  });

  final BarberServiceDto service;
  final Map<String, CurrencyDto> currencyById;
  final DorakColors colors;
  final AppLocalizations l10n;
  final String localeCode;

  @override
  Widget build(BuildContext context) {
    final currencyCode = currencyById[service.currencyId]?.code ?? '';
    final formattedPrice = LocaleFormatters.decimal(service.price, localeCode);
    return Container(
      margin: const EdgeInsets.only(bottom: DorakDimensions.spacingSmall),
      padding: const EdgeInsets.all(DorakDimensions.spacingSmall),
      decoration: BoxDecoration(
        border: Border.all(color: colors.outline),
        borderRadius: DorakDimensions.radiusMd,
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(service.name, style: DorakTypography.labelLg),
                if (service.description != null &&
                    service.description!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    service.description!,
                    style: DorakTypography.bodyMd.copyWith(
                      color: colors.onSurfaceVariant,
                    ),
                  ),
                ],
                if (service.atHome) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(
                        Icons.home,
                        size: 16,
                        color: colors.onSurfaceVariant,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        l10n.serviceAtHomeLabel,
                        style: DorakTypography.labelMd.copyWith(
                          color: colors.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: DorakDimensions.spacingSmall),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                l10n.servicePrice(formattedPrice, currencyCode),
                style: DorakTypography.labelLg.copyWith(color: colors.primary),
              ),
              if (service.duration != null) ...[
                const SizedBox(height: 4),
                Text(
                  l10n.serviceDurationLabel(service.duration!),
                  style: DorakTypography.labelMd.copyWith(
                    color: colors.onSurfaceVariant,
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
