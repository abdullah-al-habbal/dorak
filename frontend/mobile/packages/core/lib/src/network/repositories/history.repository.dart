import 'package:dio/dio.dart';

import 'package:core/core.dart';

abstract class HistoryRepository {
  Future<PaginatedData<ServiceHistoryDto>> getHistory({
    int page = 1,
    int perPage = 15,
  });

  Future<BookingDto> rebookFromHistory(String historyId, DateTime timeSlot);

  Future<HistoryMediaDto> attachMedia({
    required String historyId,
    required String photoPath,
    required String photoType,
  });

  Future<ServiceHistoryDto> updateEntry({
    required String historyId,
    int? clientRating,
    String? clientNotes,
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
  Future<BookingDto> rebookFromHistory(String historyId, DateTime timeSlot) {
    final formatted = timeSlot.toUtc().toIso8601String();
    return _apiClient.post<BookingDto>(
      ApiEndpoints.history.rebookFromHistory(historyId),
      data: {'time_slot': formatted},
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

  @override
  Future<ServiceHistoryDto> updateEntry({
    required String historyId,
    int? clientRating,
    String? clientNotes,
  }) {
    final data = <String, dynamic>{
      'client_rating': ?clientRating,
      'client_notes': ?clientNotes,
    };
    return _apiClient.patch<ServiceHistoryDto>(
      ApiEndpoints.history.updateEntry(historyId),
      data: data,
      parser: (json) =>
          ServiceHistoryDto.fromJson(json as Map<String, dynamic>),
    );
  }
}
