import 'package:business_app/src/features/operations/branch_operations.bloc.dart';
import 'package:business_app/src/features/operations/branch_operations.state.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

class BranchOperationsScreen extends StatefulWidget {
  const BranchOperationsScreen({super.key, required this.bloc});
  final BranchOperationsBloc bloc;
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
      appBar: AppBar(title: Text(l10n.businessBranchOperationsTitle)),
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
                        '${booking.timeSlot.toLocal()} · ${booking.status}',
                      ),
                      subtitle: Text(
                        booking.barber?.name ?? booking.chair?.label ?? '',
                      ),
                      trailing: PopupMenuButton<String>(
                        onSelected: (status) =>
                            widget.bloc.updateBooking(booking.id, status),
                        itemBuilder: (_) => [
                          PopupMenuItem(
                            value: 'in_progress',
                            child: Text(l10n.businessStart),
                          ),
                          PopupMenuItem(
                            value: 'completed',
                            child: Text(l10n.businessComplete),
                          ),
                          PopupMenuItem(
                            value: 'no_show',
                            child: Text(l10n.businessNoShow),
                          ),
                          PopupMenuItem(
                            value: 'canceled',
                            child: Text(l10n.businessCancelBooking),
                          ),
                        ],
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
                      '${chair.availability ?? chair.status} · ${chair.barber?.name ?? l10n.businessUnassigned}',
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
}
