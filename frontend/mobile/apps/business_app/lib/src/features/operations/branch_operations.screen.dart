import 'package:business_app/src/core/navigation/app_routes.entity.dart';
import 'package:business_app/src/features/operations/branch_operations.bloc.dart';
import 'package:business_app/src/features/operations/branch_operations.state.dart';
import 'package:business_app/src/features/operations/widgets/appointment_card.widget.dart';
import 'package:business_app/src/features/operations/widgets/chair_tile.widget.dart';
import 'package:business_app/src/features/operations/widgets/dashboard_card.widget.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

class BranchOperationsScreen extends StatefulWidget {
  const BranchOperationsScreen({
    super.key,
    required this.bloc,
    required this.onLocaleToggle,
    required this.onLogout,
    required this.onAddBarber,
    required this.onNavigate,
  });
  final BranchOperationsBloc bloc;
  final VoidCallback onLocaleToggle;
  final VoidCallback onLogout;
  final VoidCallback onAddBarber;
  final ValueChanged<String> onNavigate;
  @override
  State<BranchOperationsScreen> createState() => _BranchOperationsScreenState();
}

class _BranchOperationsScreenState extends State<BranchOperationsScreen> {
  @override
  void initState() {
    super.initState();
    widget.bloc.load();
  }

  List<(String, String)> _menu(AppLocalizations l10n) => [
    (l10n.businessMenuJobs, AppRoutes.jobs),
    (l10n.businessMenuFloorPlan, AppRoutes.floorPlan),
    (l10n.businessMenuAffiliations, AppRoutes.affiliations),
    (l10n.businessMenuProfile, AppRoutes.profile),
    (l10n.businessMenuReviews, AppRoutes.reviews),
  ];

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
          PopupMenuButton<String>(
            onSelected: widget.onNavigate,
            itemBuilder: (context) => [
              for (final entry in _menu(l10n))
                PopupMenuItem(value: entry.$2, child: Text(entry.$1)),
            ],
          ),
          TextButton(
            onPressed: widget.onLocaleToggle,
            child: Text(
              Localizations.localeOf(context).languageCode == 'en'
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
              child: FilledButton(
                onPressed: widget.bloc.load,
                child: Text(l10n.businessRetry),
              ),
            );
          }
          final dashboard = state.dashboard;
          return RefreshIndicator(
            onRefresh: widget.bloc.load,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (state.profile != null)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(state.profile!.name),
                    subtitle: Text(state.profile!.email),
                  ),
                if (dashboard != null) DashboardCard(dashboard: dashboard, l10n: l10n),
                const SizedBox(height: 16),
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
                const SizedBox(height: 16),
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
