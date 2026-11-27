import 'package:dio/dio.dart';

import 'package:core/core.dart';

abstract class HistoryRepository {
  Future<PaginatedData<ServiceHistoryDto>> getHistory({
    int page = 1,
    int perPage = 15,
  });

  Future<BookingDto> rebookFromHistory(String historyId, DateTime startsAt);

  Future<HistoryMediaDto> attachMedia({
    required String historyId,
    required String photoPath,
    required String photoType,
  });
}

class DioHistoryRepository implements HistoryRepository {
  const DioHistoryRepository(this._apiClient);

  final ApiClient _apiClient;

  @override
  Future<PaginatedData<ServiceHistoryDto>> getHistory({
    int page = 1,
    int perPage = 15,
  }) {
    return _apiClient.getPaginated<ServiceHistoryDto>(
      ApiEndpoints.history.history,
      queryParameters: {'page': page, 'per_page': perPage},
      itemParser: (json) =>
          ServiceHistoryDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<BookingDto> rebookFromHistory(String historyId, DateTime startsAt) {
    return _apiClient.post<BookingDto>(
      ApiEndpoints.history.rebookFromHistory(historyId),
      // The picked time is on the visit branch's clock; only the backend knows its zone.
      data: {'starts_at_local': BranchClock.wallClockMinute(startsAt)},
      parser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
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
      ApiEndpoints.history.attachMedia(historyId),
      data: formData,
      parser: (json) => HistoryMediaDto.fromJson(json as Map<String, dynamic>),
    );
  }
}
