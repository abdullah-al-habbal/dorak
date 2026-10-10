import 'package:core/core.dart';

abstract class ManagedBarberRepository {
  Future<ManagedBarberDto> createManualBarber({
    required String nameEn,
    required String nameAr,
    required String phone,
    String? chairId,
  });
}

class DioManagedBarberRepository implements ManagedBarberRepository {
  const DioManagedBarberRepository(this._apiClient);

  final ApiClient _apiClient;

  @override
  Future<ManagedBarberDto> createManualBarber({
    required String nameEn,
    required String nameAr,
    required String phone,
    String? chairId,
  }) {
    return _apiClient.post<ManagedBarberDto>(
      BranchEndpoints.managedBarbers,
      data: {
        'name': {'en': nameEn, 'ar': nameAr},
        'phone': phone,
        'chair_id': ?chairId,
      },
      parser: (json) => ManagedBarberDto.fromJson(json as Map<String, dynamic>),
    );
  }
}
