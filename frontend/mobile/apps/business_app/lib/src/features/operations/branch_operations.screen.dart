import 'package:business_app/src/features/operations/branch_operations.bloc.dart';
import 'package:business_app/src/features/operations/branch_operations.state.dart';
import 'package:business_app/src/features/operations/widgets/appointment_card.widget.dart';
import 'package:business_app/src/features/operations/widgets/chair_tile.widget.dart';
import 'package:business_app/src/features/operations/widgets/dashboard_card.widget.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';
import 'package:business_app/src/core/locale/app_locales.entity.dart';
import 'package:business_app/src/features/shared/feature_error.widget.dart';

class BranchOperationsScreen extends StatefulWidget {
  const BranchOperationsScreen({
    super.key,
    required this.bloc,
    required this.onLocaleToggle,
    required this.onLogout,
    required this.onAddBarber,
  });
  final BranchOperationsBloc bloc;
  final VoidCallback onLocaleToggle;
  final VoidCallback onLogout;
  final VoidCallback onAddBarber;
  @override
  State<BranchOperationsScreen> createState() => _BranchOperationsScreenState();
}

class _BranchOperationsScreenState extends State<BranchOperationsScreen> {
  @override
  void initState() {
    super.initState();
    widget.bloc.load();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.businessBranchOperationsTitle),
        actions: [
          IconButton(
            tooltip: l10n.staffLogOut,
            onPressed: widget.onLogout,
            icon: const Icon(Icons.logout),
          ),
          IconButton(
            tooltip: l10n.managerManualBarberTitle,
            onPressed: widget.onAddBarber,
            icon: const Icon(Icons.person_add_alt_1_outlined),
          ),
          TextButton(
            onPressed: widget.onLocaleToggle,
            child: Text(
              Localizations.localeOf(context).languageCode ==
                      AppLocales.englishCode
                  ? l10n.localeArabic
                  : l10n.localeEnglish,
            ),
          ),
        ],
      ),
      body: BlocConsumer<BranchOperationsBloc, BranchOperationsState>(
        bloc: widget.bloc,
        listenWhen: (previous, current) =>
            previous.pendingMaintenance != current.pendingMaintenance &&
            current.pendingMaintenance != null,
        listener: (context, state) =>
            _confirmMaintenance(context, state.pendingMaintenance!),
        builder: (context, state) {
          if (state.loading && state.dashboard == null) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.error != null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(DorakDimensions.marginMobile),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    FeatureError(
                      error: state.error!,
                      fallbackMessage: state.isUpdateError
                          ? l10n.businessUpdateFailed
                          : l10n.businessLoadFailed,
                    ),
                    FilledButton(
                      onPressed: widget.bloc.load,
                      child: Text(l10n.businessRetry),
                    ),
                  ],
                ),
              ),
            );
          }
          final dashboard = state.dashboard;
          return RefreshIndicator(
            onRefresh: widget.bloc.load,
            child: ListView(
              padding: const EdgeInsets.all(DorakDimensions.spacingMedium),
              children: [
                if (state.profile != null)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(state.profile!.name),
                    subtitle: Text(state.profile!.email),
                  ),
                if (dashboard != null)
                  DashboardCard(dashboard: dashboard, l10n: l10n),
                const SizedBox(height: DorakDimensions.spacingMedium),
                Text(
                  l10n.businessAppointmentsTitle,
                  style: DorakTypography.titleLg,
                ),
                ...state.bookings.map(
                  (booking) => AppointmentCard(
                    booking: booking,
                    l10n: l10n,
                    onStatusChanged: (status) =>
                        widget.bloc.updateBooking(booking.id, status),
                  ),
                ),
                const SizedBox(height: DorakDimensions.spacingMedium),
                Text(l10n.businessChairsTitle, style: DorakTypography.titleLg),
                ...state.chairs.map(
                  (chair) => ChairTile(
                    chair: chair,
                    l10n: l10n,
                    onStatusChanged: (status) =>
                        widget.bloc.updateChairStatus(chair.id, status),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _confirmMaintenance(
    BuildContext context,
    PendingChairMaintenance pending,
  ) async {
    final l10n = AppLocalizations.of(context)!;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(l10n.chairMaintenanceConflictTitle),
        content: Text(l10n.chairMaintenanceConflictBody(pending.bookingCount)),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: Text(l10n.chairMaintenanceConflictKeep),
          ),
          FilledButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: Text(
              l10n.chairMaintenanceConflictConfirm(pending.bookingCount),
            ),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await widget.bloc.confirmChairMaintenance();
    } else {
      widget.bloc.dismissChairMaintenance();
    }
  }
}
