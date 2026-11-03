import 'package:core/core.dart';
import 'package:equatable/equatable.dart';

class BusinessInboxState extends Equatable {
  const BusinessInboxState({
    this.page = const Paged<NotificationDto>.initial(),
    this.marking = false,
    this.error,
  });

  final Paged<NotificationDto> page;
  final bool marking;
  final Object? error;

  int get unreadCount => page.items.where((item) => item.isUnread).length;

  BusinessInboxState copyWith({
    Paged<NotificationDto>? page,
    bool? marking,
    Object? error,
    bool clearError = false,
  }) => BusinessInboxState(
    page: page ?? this.page,
    marking: marking ?? this.marking,
    error: clearError ? null : error ?? this.error,
  );

  @override
  List<Object?> get props => [page, marking, error];
}
