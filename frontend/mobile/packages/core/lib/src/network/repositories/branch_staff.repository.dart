import 'package:core/core.dart';

abstract class BranchStaffRepository {
  Future<PaginatedData<StaffMemberDto>> getStaff({
    int page = 1,
    int perPage = 20,
  });
}

class DioBranchStaffRepository implements BranchStaffRepository {
  const DioBranchStaffRepository(this._client);

  final ApiClient _client;

  @override
  Future<PaginatedData<StaffMemberDto>> getStaff({
    int page = 1,
    int perPage = 20,
  }) => _client.getPaginated(
    ApiEndpoints.branch.managedBarbers,
    queryParameters: {'page': page, 'per_page': perPage},
    itemParser: (json) => StaffMemberDto.fromJson(json as Map<String, dynamic>),
  );
}
