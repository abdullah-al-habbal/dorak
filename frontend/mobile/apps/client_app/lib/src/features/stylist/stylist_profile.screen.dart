import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:design_system/design_system.dart';

import 'package:client_app/src/features/stylist/stylist_profile.bloc.dart';
import 'package:client_app/src/features/stylist/stylist_profile.event.dart';
import 'package:client_app/src/features/stylist/stylist_profile.state.dart';
import 'package:client_app/src/features/stylist/widgets/stylist_profile_body.widget.dart';
import 'package:core/core.dart';
import 'package:client_app/src/core/errors/load_error_message.entity.dart';

class StylistProfileScreen extends StatefulWidget {
  const StylistProfileScreen({
    super.key,
    required this.bloc,
    required this.barberId,
    required this.onLocaleToggle,
    required this.onBook,
  });

  final StylistProfileBloc bloc;
  final String barberId;
  final VoidCallback onLocaleToggle;
  final void Function(String branchId, String barberId, List<String> serviceIds)
  onBook;

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
    final isArabic =
        Localizations.localeOf(context).languageCode == LocaleCodes.arabic;
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
              message: LoadErrorMessage.of(l10n, state.error),
              actionLabel: l10n.actionRetry,
              onAction: () => widget.bloc.add(const StylistProfileRetried()),
            );
          }
          if (state.isLoading || state.profile == null) {
            return const AppLoader.page();
          }
          return StylistProfileBody(
            bloc: widget.bloc,
            state: state,
            onBook: widget.onBook,
          );
        },
      ),
    );
  }
}
