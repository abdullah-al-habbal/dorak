import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class DashboardCard extends StatelessWidget {
  const DashboardCard({super.key, required this.dashboard, required this.l10n});

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
  );
}
