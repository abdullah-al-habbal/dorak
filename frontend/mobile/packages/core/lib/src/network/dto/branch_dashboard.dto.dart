import 'package:core/src/network/dto/assigned_branch.dto.dart';

class BranchDashboardDto {
  const BranchDashboardDto({
    required this.todayRevenue,
    required this.monthlyRevenue,
    required this.todayBookings,
    required this.activeChairs,
    required this.totalChairs,
    required this.chairStatusCounts,
    required this.assignedBranches,
  });

  final double todayRevenue;
  final double monthlyRevenue;
  final int todayBookings;
  final int activeChairs;
  final int totalChairs;
  final Map<String, int> chairStatusCounts;
  final List<AssignedBranchDto> assignedBranches;

  factory BranchDashboardDto.fromJson(Map<String, dynamic> json) {
    final counts = (json['chair_status_counts'] as Map?) ?? const {};
    return BranchDashboardDto(
      todayRevenue: (json['today_revenue'] as num?)?.toDouble() ?? 0,
      monthlyRevenue: (json['monthly_revenue'] as num?)?.toDouble() ?? 0,
      todayBookings: (json['today_bookings'] as num?)?.toInt() ?? 0,
      activeChairs: (json['active_chairs'] as num?)?.toInt() ?? 0,
      totalChairs: (json['total_chairs'] as num?)?.toInt() ?? 0,
      chairStatusCounts: counts.map(
        (key, value) => MapEntry('$key', (value as num).toInt()),
      ),
      assignedBranches: ((json['assigned_branches'] as List?) ?? const [])
          .whereType<Map>()
          .map(
            (branch) => AssignedBranchDto.fromJson(
              branch.map((key, value) => MapEntry(key.toString(), value)),
            ),
          )
          .toList(growable: false),
    );
  }
}
