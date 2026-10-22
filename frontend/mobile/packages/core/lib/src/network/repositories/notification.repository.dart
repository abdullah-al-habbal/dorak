import 'package:core/core.dart';

abstract class NotificationRepository {
  Future<PaginatedData<NotificationDto>> getNotifications({
    int page = 1,
    int perPage = 20,
  });

  Future<NotificationDto> markRead(String notificationId);

  Future<void> markAllRead();
}

class DioNotificationRepository implements NotificationRepository {
  const DioNotificationRepository(this._apiClient);

  final ApiClient _apiClient;

  @override
  Future<PaginatedData<NotificationDto>> getNotifications({
    int page = 1,
    int perPage = 20,
  }) {
    return _apiClient.getPaginated<NotificationDto>(
      NotificationEndpoints.notifications,
      queryParameters: {'page': page, 'per_page': perPage},
      itemParser: (json) =>
          NotificationDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<NotificationDto> markRead(String notificationId) {
    return _apiClient.patch<NotificationDto>(
      NotificationEndpoints.markRead.replaceFirst(
        '{notification}',
        notificationId,
      ),
      parser: (json) => NotificationDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<void> markAllRead() {
    return _apiClient.post<void>(
      NotificationEndpoints.markAllRead,
      parser: _discardBody,
    );
  }

  static void _discardBody(dynamic _) {}
}
