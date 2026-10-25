import 'package:core/core.dart';

abstract class ManagedBarberRepository {
  Future<ManagedBarberDto> createManualBarber({
    required String nameEn,
    required String nameAr,
    required String phone,
    String? chairId,
  });

  Future<ActivationLogDto> activateBarber(String barberId);

  Future<ActivationLogDto> deactivateBarber(String barberId);
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
      ApiEndpoints.branch.managedBarbers,
      data: {
        'name': {'en': nameEn, 'ar': nameAr},
        'phone': phone,
        'chair_id': ?chairId,
      },
      parser: (json) => ManagedBarberDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<ActivationLogDto> activateBarber(String barberId) {
    return _apiClient.post<ActivationLogDto>(
      ApiEndpoints.branch.activateBarber(barberId),
      parser: (json) => ActivationLogDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<ActivationLogDto> deactivateBarber(String barberId) {
    return _apiClient.post<ActivationLogDto>(
      ApiEndpoints.branch.deactivateBarber(barberId),
      parser: (json) => ActivationLogDto.fromJson(json as Map<String, dynamic>),
    );
  }
}
