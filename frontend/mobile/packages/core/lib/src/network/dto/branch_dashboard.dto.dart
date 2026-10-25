import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/assigned_branch.dto.dart';

part 'branch_dashboard.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class BranchDashboardDto {
  final double todayRevenue;
  final double monthlyRevenue;
  final int todayBookings;
  final int activeChairs;
  final int totalChairs;
  final Map<String, int> chairStatusCounts;
  final List<AssignedBranchDto> assignedBranches;

  const BranchDashboardDto({
    required this.todayRevenue,
    required this.monthlyRevenue,
    required this.todayBookings,
    required this.activeChairs,
    required this.totalChairs,
    required this.chairStatusCounts,
    required this.assignedBranches,
  });

  factory BranchDashboardDto.fromJson(Map<String, dynamic> json) =>
      _$BranchDashboardDtoFromJson(json);
}
