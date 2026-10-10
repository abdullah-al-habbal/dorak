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
    return _apiClient.get<FloorPlanDto>(
      BranchEndpoints.floorPlan.replaceFirst('{branch}', branchId),
      queryParameters: {
        'date':
            '${timeSlot.year.toString().padLeft(4, '0')}-${timeSlot.month.toString().padLeft(2, '0')}-${timeSlot.day.toString().padLeft(2, '0')}',
        'time_slot':
            '${timeSlot.hour.toString().padLeft(2, '0')}:${timeSlot.minute.toString().padLeft(2, '0')}',
        'duration': durationMinutes,
      },
      parser: (json) => FloorPlanDto.fromJson(json as Map<String, dynamic>),
    );
  }
}
