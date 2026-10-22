import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class NotificationsState extends Equatable {
  const NotificationsState({
    this.page = const Paged<NotificationDto>.initial(),
    this.markingId,
    this.isMarkingAll = false,
    this.error,
  });

  final Paged<NotificationDto> page;
  final String? markingId;
  final bool isMarkingAll;
  final Object? error;

  bool get hasUnread => page.items.any((item) => item.isUnread);

  NotificationsState copyWith({
    Paged<NotificationDto>? page,
    String? markingId,
    bool clearMarking = false,
    bool? isMarkingAll,
    Object? error,
    bool clearError = false,
  }) {
    return NotificationsState(
      page: page ?? this.page,
      markingId: clearMarking ? null : markingId ?? this.markingId,
      isMarkingAll: isMarkingAll ?? this.isMarkingAll,
      error: clearError ? null : error ?? this.error,
    );
  }

  @override
  List<Object?> get props => [page, markingId, isMarkingAll, error];
}
