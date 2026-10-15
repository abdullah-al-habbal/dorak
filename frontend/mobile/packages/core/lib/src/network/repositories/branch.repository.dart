import 'package:core/core.dart';

abstract class BranchRepository {
  Future<FloorPlanDto> getFloorPlan(
    String branchId, {
    required DateTime timeSlot,
    required int durationMinutes,
  });
}

class DioBranchRepository implements BranchRepository {
  const DioBranchRepository(this._apiClient);

  final ApiClient _apiClient;

  @override
  Future<FloorPlanDto> getFloorPlan(
    String branchId, {
    required DateTime timeSlot,
    required int durationMinutes,
  }) {
    final startsAt = timeSlot.toUtc().toIso8601String();
    return _apiClient.get<FloorPlanDto>(
      BranchEndpoints.floorPlan.replaceFirst('{branch}', branchId),
      queryParameters: {'starts_at': startsAt, 'duration': durationMinutes},
      parser: (json) => FloorPlanDto.fromJson(json as Map<String, dynamic>),
    );
  }
}
