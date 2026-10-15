import 'package:core/core.dart';

abstract class BranchRepository {
  Future<FloorPlanDto> getFloorPlan(
    String branchId, {
    required DateTime timeSlot,
    required int durationMinutes,
  });

  Future<List<SlotDto>> getBranchSlots(
    String branchId, {
    required DateTime date,
    required List<String> serviceIds,
    String? chairId,
    String? barberId,
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

  @override
  Future<List<SlotDto>> getBranchSlots(
    String branchId, {
    required DateTime date,
    required List<String> serviceIds,
    String? chairId,
    String? barberId,
  }) {
    final query = <String, dynamic>{
      'date': date.toUtc().toIso8601String().split('T').first,
      'service_ids': serviceIds,
    };
    if (chairId != null) {
      query['chair_id'] = chairId;
    }
    if (barberId != null) {
      query['barber_id'] = barberId;
    }
    return _apiClient.get<List<SlotDto>>(
      BranchEndpoints.slots.replaceFirst('{branch}', branchId),
      queryParameters: query,
      parser: (json) {
        if (json is List) {
          return json
              .whereType<Map<String, dynamic>>()
              .map(SlotDto.fromJson)
              .toList();
        }
        throw const FormatException('Expected a list of slots');
      },
    );
  }
}
