// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'branch_dashboard.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BranchDashboardDto _$BranchDashboardDtoFromJson(Map<String, dynamic> json) =>
    BranchDashboardDto(
      todayRevenue: (json['today_revenue'] as num).toDouble(),
      monthlyRevenue: (json['monthly_revenue'] as num).toDouble(),
      todayBookings: (json['today_bookings'] as num).toInt(),
      activeChairs: (json['active_chairs'] as num).toInt(),
      totalChairs: (json['total_chairs'] as num).toInt(),
      chairStatusCounts: Map<String, int>.from(
        json['chair_status_counts'] as Map,
      ),
      assignedBranches: (json['assigned_branches'] as List<dynamic>)
          .map((e) => AssignedBranchDto.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
