import 'package:business_app/src/features/operations/branch_operations.bloc.dart';
import 'package:business_app/src/features/operations/booking_status_menu.widget.dart';
import 'package:business_app/src/features/operations/branch_operations.state.dart';
import 'package:core/core.dart';
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
                if (dashboard != null) _DashboardCard(dashboard: dashboard, l10n: l10n),
                const SizedBox(height: 16),
                Text(
                  l10n.businessAppointmentsTitle,
                  style: DorakTypography.titleLg,
                ),
                ...state.bookings.map(
                  (booking) => _AppointmentCard(
                    booking: booking,
                    l10n: l10n,
                    onStatusChanged: (status) =>
                        widget.bloc.updateBooking(booking.id, status),
                  ),
                ),
                const SizedBox(height: 16),
                Text(l10n.businessChairsTitle, style: DorakTypography.titleLg),
                ...state.chairs.map(
                  (chair) => _ChairTile(
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

class _DashboardCard extends StatelessWidget {
  const _DashboardCard({required this.dashboard, required this.l10n});

  final BranchDashboardDto dashboard;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(l10n.businessDashboardTitle, style: DorakTypography.titleLg),
          Text(l10n.businessTodayRevenue(dashboard.todayRevenue)),
          Text(l10n.businessMonthlyRevenue(dashboard.monthlyRevenue)),
          Text(l10n.businessTodayBookings(dashboard.todayBookings)),
          Text(
            l10n.businessActiveChairs(
              dashboard.activeChairs,
              dashboard.totalChairs,
            ),
          ),
          Text(l10n.businessChairStatus(dashboard.chairStatusCounts)),
          DropdownButton<String>(
            hint: Text(l10n.businessBranchHint),
            items: dashboard.assignedBranches
                .map(
                  (branch) =>
                      DropdownMenuItem(value: branch.id, child: Text(branch.name)),
                )
                .toList(),
            onChanged: (_) {},
          ),
        ],
      ),
    ),
  );
}

class _AppointmentCard extends StatelessWidget {
  const _AppointmentCard({
    required this.booking,
    required this.l10n,
    required this.onStatusChanged,
  });

  final BookingDto booking;
  final AppLocalizations l10n;
  final void Function(BookingStatus status) onStatusChanged;

  String get _statusLabel => switch (booking.status) {
    BookingStatus.pending => l10n.bookingStatusPending,
    BookingStatus.confirmed => l10n.bookingStatusConfirmed,
    BookingStatus.inProgress => l10n.bookingStatusInProgress,
    BookingStatus.completed => l10n.bookingStatusCompleted,
    BookingStatus.canceled => l10n.bookingStatusCanceled,
    BookingStatus.noShow => l10n.bookingStatusNoShow,
  };

  @override
  Widget build(BuildContext context) {
    final materialL10n = MaterialLocalizations.of(context);
    final timeSlot = booking.timeSlot.toLocal();
    return Card(
      child: ListTile(
        title: Text(
          l10n.businessAppointmentDateTime(
            materialL10n.formatMediumDate(timeSlot),
            materialL10n.formatTimeOfDay(TimeOfDay.fromDateTime(timeSlot)),
          ),
        ),
        subtitle: Text(
          '${booking.barber?.name ?? booking.chair?.label ?? l10n.businessUnassigned} · $_statusLabel',
        ),
        trailing: BookingStatusMenu(
          currentStatus: booking.status,
          onSelected: onStatusChanged,
        ),
      ),
    );
  }
}

class _ChairTile extends StatelessWidget {
  const _ChairTile({
    required this.chair,
    required this.l10n,
    required this.onStatusChanged,
  });

  final FloorChairDto chair;
  final AppLocalizations l10n;
  final void Function(ChairStatus status) onStatusChanged;

  String get _statusLabel => switch (chair.availability ?? chair.status) {
    ChairStatus.available => l10n.chairStatusAvailable,
    ChairStatus.occupied => l10n.chairStatusOccupied,
    ChairStatus.maintenance => l10n.chairStatusMaintenance,
  };

  @override
  Widget build(BuildContext context) => ListTile(
    title: Text(chair.label ?? chair.id),
    subtitle: Text(
      '$_statusLabel · ${chair.barber?.name ?? l10n.businessUnassigned}',
    ),
    trailing: PopupMenuButton<ChairStatus>(
      onSelected: onStatusChanged,
      itemBuilder: (_) => [
        PopupMenuItem(
          value: ChairStatus.available,
          child: Text(l10n.chairStatusAvailable),
        ),
        PopupMenuItem(
          value: ChairStatus.occupied,
          child: Text(l10n.chairStatusOccupied),
        ),
        PopupMenuItem(
          value: ChairStatus.maintenance,
          child: Text(l10n.chairStatusMaintenance),
        ),
      ],
    ),
  );
}
