import 'package:core/core.dart';

abstract class HistoryRepository {
  Future<PaginatedData<ServiceHistoryDto>> getHistory({
    int page = 1,
    int perPage = 15,
  });

  Future<BookingDto> rebookFromHistory(String historyId, DateTime timeSlot);
  Future<HistoryMediaDto> attachMedia({
    required String historyId,
    required String photoUrl,
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
      HistoryEndpoints.history,
      queryParameters: {'page': page, 'per_page': perPage},
      itemParser: (json) =>
          ServiceHistoryDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<BookingDto> rebookFromHistory(String historyId, DateTime timeSlot) {
    final formatted = timeSlot.toUtc().toIso8601String();
    return _apiClient.post<BookingDto>(
      HistoryEndpoints.rebookFromHistory.replaceFirst('{history}', historyId),
      data: {'time_slot': formatted},
      parser: (json) => BookingDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<HistoryMediaDto> attachMedia({
    required String historyId,
    required String photoUrl,
    required String photoType,
  }) => _apiClient.post(
    HistoryEndpoints.attachMedia.replaceFirst('{history}', historyId),
    data: {'photo_url': photoUrl, 'photo_type': photoType},
    parser: (json) => HistoryMediaDto.fromJson(json as Map<String, dynamic>),
  );
}
