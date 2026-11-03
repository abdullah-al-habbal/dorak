import 'package:dio/dio.dart';

import 'package:core/core.dart';

/// Lets a stylist read a client's service history and tag photos on visits
/// they performed. The backend answers 403 for a visit assigned to another
/// barber.
abstract class BarberHistoryRepository {
  Future<PaginatedData<ServiceHistoryDto>> getClientHistory(
    String clientId, {
    int page = 1,
    int perPage = 15,
  });

  /// [photoType] is `before`, `after` or `reference`.
  Future<HistoryMediaDto> attachMedia({
    required String historyId,
    required String photoPath,
    required String photoType,
  });
}

class DioBarberHistoryRepository implements BarberHistoryRepository {
  const DioBarberHistoryRepository(this._apiClient);

  final ApiClient _apiClient;

  @override
  Future<PaginatedData<ServiceHistoryDto>> getClientHistory(
    String clientId, {
    int page = 1,
    int perPage = 15,
  }) {
    return _apiClient.getPaginated<ServiceHistoryDto>(
      ApiEndpoints.history.barberClientHistory(clientId),
      queryParameters: {'page': page, 'per_page': perPage},
      itemParser: (json) =>
          ServiceHistoryDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<HistoryMediaDto> attachMedia({
    required String historyId,
    required String photoPath,
    required String photoType,
  }) async {
    final formData = FormData.fromMap({
      'photo': await MultipartFile.fromFile(photoPath),
      'photo_type': photoType,
    });
    return _apiClient.post<HistoryMediaDto>(
      ApiEndpoints.history.barberAttachMedia(historyId),
      data: formData,
      parser: (json) => HistoryMediaDto.fromJson(json as Map<String, dynamic>),
    );
  }
}
