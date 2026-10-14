import 'package:business_app/src/features/operations/branch_operations.bloc.dart';
import 'package:business_app/src/features/operations/booking_status_menu.widget.dart';
import 'package:business_app/src/features/operations/branch_operations.state.dart';
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
      body: BlocBuilder<BranchOperationsBloc, BranchOperationsState>(
        bloc: widget.bloc,
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
                if (dashboard != null)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.businessDashboardTitle,
                            style: DorakTypography.titleLg,
                          ),
                          Text(
                            l10n.businessTodayRevenue(dashboard.todayRevenue),
                          ),
                          Text(
                            l10n.businessMonthlyRevenue(
                              dashboard.monthlyRevenue,
                            ),
                          ),
                          Text(
                            l10n.businessTodayBookings(dashboard.todayBookings),
                          ),
                          Text(
                            l10n.businessActiveChairs(
                              dashboard.activeChairs,
                              dashboard.totalChairs,
                            ),
                          ),
                          Text(
                            l10n.businessChairStatus(
                              dashboard.chairStatusCounts,
                            ),
                          ),
                          DropdownButton<String>(
                            hint: Text(l10n.businessBranchHint),
                            items: dashboard.assignedBranches
                                .map(
                                  (branch) => DropdownMenuItem(
                                    value: branch.id,
                                    child: Text(branch.name),
                                  ),
                                )
                                .toList(),
                            onChanged: (_) {},
                          ),
                        ],
                      ),
                    ),
                  ),
                const SizedBox(height: 16),
                Text(
                  l10n.businessAppointmentsTitle,
                  style: DorakTypography.titleLg,
                ),
                ...state.bookings.map(
                  (booking) => Card(
                    child: ListTile(
                      title: Text(
                        l10n.businessAppointmentDateTime(
                          MaterialLocalizations.of(
                            context,
                          ).formatMediumDate(booking.timeSlot.toLocal()),
                          MaterialLocalizations.of(context).formatTimeOfDay(
                            TimeOfDay.fromDateTime(booking.timeSlot.toLocal()),
                          ),
                        ),
                      ),
                      subtitle: Text(
                        '${booking.barber?.name ?? booking.chair?.label ?? l10n.businessUnassigned} · ${_bookingStatus(l10n, booking.status)}',
                      ),
                      trailing: BookingStatusMenu(
                        currentStatus: booking.status,
                        onSelected: (status) =>
                            widget.bloc.updateBooking(booking.id, status),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(l10n.businessChairsTitle, style: DorakTypography.titleLg),
                ...state.chairs.map(
                  (chair) => ListTile(
                    title: Text(chair.label ?? chair.id),
                    subtitle: Text(
                      '${_chairStatus(l10n, chair.availability ?? chair.status)} · ${chair.barber?.name ?? l10n.businessUnassigned}',
                    ),
                    trailing: PopupMenuButton<String>(
                      onSelected: (status) =>
                          widget.bloc.updateChairStatus(chair.id, status),
                      itemBuilder: (_) => [
                        PopupMenuItem(
                          value: 'available',
                          child: Text(l10n.chairStatusAvailable),
                        ),
                        PopupMenuItem(
                          value: 'occupied',
                          child: Text(l10n.chairStatusOccupied),
                        ),
                        PopupMenuItem(
                          value: 'maintenance',
                          child: Text(l10n.chairStatusMaintenance),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  String _bookingStatus(AppLocalizations l10n, String status) =>
      switch (status) {
        'pending' => l10n.bookingStatusPending,
        'confirmed' => l10n.bookingStatusConfirmed,
        'in_progress' => l10n.bookingStatusInProgress,
        'completed' => l10n.bookingStatusCompleted,
        'canceled' || 'cancelled' => l10n.bookingStatusCanceled,
        'no_show' => l10n.bookingStatusNoShow,
        _ => l10n.bookingStatusUnknown,
      };

  String _chairStatus(AppLocalizations l10n, String status) => switch (status) {
    'available' => l10n.chairStatusAvailable,
    'occupied' => l10n.chairStatusOccupied,
    'maintenance' => l10n.chairStatusMaintenance,
    _ => l10n.chairStatusUnknown,
  };
}
