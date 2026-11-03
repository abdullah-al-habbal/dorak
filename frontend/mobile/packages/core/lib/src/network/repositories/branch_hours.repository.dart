import 'package:core/core.dart';

abstract class BranchHoursRepository {
  Future<BranchProfileDto> getProfile();

  /// Replaces the weekly opening hours of the signed-in branch.
  Future<void> updateOpeningHours(List<BranchOpeningHourDto> hours);
}

class DioBranchHoursRepository implements BranchHoursRepository {
  const DioBranchHoursRepository(this._client);

  final ApiClient _client;

  @override
  Future<BranchProfileDto> getProfile() => _client.get(
    ApiEndpoints.branch.profile,
    parser: (json) => BranchProfileDto.fromJson(json as Map<String, dynamic>),
  );

  @override
  Future<void> updateOpeningHours(List<BranchOpeningHourDto> hours) =>
      _client.put<void>(
        ApiEndpoints.branch.openingHours,
        data: {'hours': hours.map((hour) => hour.toJson()).toList()},
        parser: (_) {},
      );
}
