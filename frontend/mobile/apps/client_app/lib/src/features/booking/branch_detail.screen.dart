import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:design_system/design_system.dart';

import 'package:client_app/src/features/booking/branch_detail.bloc.dart';
import 'package:client_app/src/features/booking/branch_detail.event.dart';
import 'package:client_app/src/features/booking/branch_detail.state.dart';
import 'package:client_app/src/features/booking/widgets/branch_detail_body.widget.dart';

class BranchDetailScreen extends StatefulWidget {
  const BranchDetailScreen({
    super.key,
    required this.bloc,
    required this.branchId,
    required this.onLocaleToggle,
    required this.onViewBookings,
    required this.onBarberSelected,
    required this.onFavorite,
    this.barberId,
    this.serviceIds = const [],
  });

  final BranchDetailBloc bloc;
  final String branchId;
  final String? barberId;
  final List<String> serviceIds;
  final VoidCallback onLocaleToggle;
  final VoidCallback onViewBookings;
  final void Function(String barberId) onBarberSelected;
  final void Function(String favorableId, String favorableType) onFavorite;

  @override
  State<BranchDetailScreen> createState() => _BranchDetailScreenState();
}

class _BranchDetailScreenState extends State<BranchDetailScreen> {
  @override
  void initState() {
    super.initState();
    widget.bloc.add(
      BranchDetailStarted(
        widget.branchId,
        barberId: widget.barberId,
        serviceIds: widget.serviceIds,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    return Scaffold(
      appBar: AppBar(
        title: BlocBuilder<BranchDetailBloc, BranchDetailState>(
          bloc: widget.bloc,
          buildWhen: (previous, current) =>
              previous.detail?.name != current.detail?.name,
          builder: (context, state) => Text(state.detail?.name ?? ''),
        ),
        actions: [
          LocaleSwitcher(
            label: isArabic ? l10n.localeEnglish : l10n.localeArabic,
            onPressed: widget.onLocaleToggle,
          ),
        ],
      ),
      body: BlocBuilder<BranchDetailBloc, BranchDetailState>(
        bloc: widget.bloc,
        builder: (context, state) {
          if (state.error != null && state.detail == null) {
            return StatusView(
              icon: Icons.error_outline,
              title: l10n.errorTitleGeneric,
              message: l10n.errorNetwork,
              actionLabel: l10n.actionRetry,
              onAction: () => widget.bloc.add(const BranchDetailRetried()),
            );
          }
          if (state.isLoading || state.detail == null) {
            return const AppLoader.page();
          }
          if (state.succeeded) {
            return StatusView(
              icon: Icons.check_circle_outline,
              title: l10n.bookingSuccessTitle,
              message: l10n.bookingSuccessMessage,
              actionLabel: l10n.bookingViewBookings,
              onAction: widget.onViewBookings,
            );
          }
          return BranchDetailBody(
            bloc: widget.bloc,
            state: state,
            onBarberSelected: widget.onBarberSelected,
            onFavorite: widget.onFavorite,
          );
        },
      ),
    );
  }
}
