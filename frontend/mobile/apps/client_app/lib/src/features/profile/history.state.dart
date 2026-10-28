import 'package:equatable/equatable.dart';
import 'package:core/core.dart';

class HistoryState extends Equatable {
  const HistoryState({
    this.page = const Paged<ServiceHistoryDto>.initial(),
    this.rebookingId,
    this.rebooked = false,
    this.rebookError,
    this.attachingId,
    this.mediaAttached = false,
    this.mediaError,
  });

  final Paged<ServiceHistoryDto> page;
  final String? rebookingId;
  final bool rebooked;
  final Object? rebookError;
  final String? attachingId;
  final bool mediaAttached;
  final Object? mediaError;

  HistoryState copyWith({
    Paged<ServiceHistoryDto>? page,
    String? rebookingId,
    bool clearRebooking = false,
    bool? rebooked,
    Object? rebookError,
    bool clearRebookError = false,
    String? attachingId,
    bool clearAttaching = false,
    bool? mediaAttached,
    Object? mediaError,
    bool clearMediaError = false,
  }) {
    return HistoryState(
      page: page ?? this.page,
      rebookingId: clearRebooking ? null : rebookingId ?? this.rebookingId,
      rebooked: rebooked ?? this.rebooked,
      rebookError: clearRebookError ? null : rebookError ?? this.rebookError,
      attachingId: clearAttaching ? null : attachingId ?? this.attachingId,
      mediaAttached: mediaAttached ?? this.mediaAttached,
      mediaError: clearMediaError ? null : mediaError ?? this.mediaError,
    );
  }

  @override
  List<Object?> get props => [
    page,
    rebookingId,
    rebooked,
    rebookError,
    attachingId,
    mediaAttached,
    mediaError,
  ];
}
