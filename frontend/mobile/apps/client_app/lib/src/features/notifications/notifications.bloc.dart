import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:client_app/src/features/notifications/notifications.event.dart';
import 'package:client_app/src/features/notifications/notifications.state.dart';

class NotificationsBloc extends Bloc<NotificationsEvent, NotificationsState> {
  NotificationsBloc(this._repository) : super(const NotificationsState()) {
    on<NotificationsStarted>(_onStarted);
    on<NotificationsRefreshRequested>(_onRefresh);
    on<NotificationsLoadMoreRequested>(_onLoadMore);
    on<NotificationsRetryRequested>(_onRetry);
    on<NotificationMarkReadRequested>(_onMarkRead);
    on<NotificationsMarkAllReadRequested>(_onMarkAllRead);
  }

  final NotificationRepository _repository;

  Future<void> _onStarted(
    NotificationsStarted event,
    Emitter<NotificationsState> emit,
  ) async {
    if (state.page.items.isNotEmpty || state.page.isBusy) return;
    await _loadFirst(emit);
  }

  Future<void> _onRefresh(
    NotificationsRefreshRequested event,
    Emitter<NotificationsState> emit,
  ) async {
    emit(state.copyWith(page: state.page.refreshing(), clearError: true));
    await _fetchFirst(emit);
  }

  Future<void> _onLoadMore(
    NotificationsLoadMoreRequested event,
    Emitter<NotificationsState> emit,
  ) async {
    if (!state.page.hasMore || state.page.isBusy) return;
    emit(state.copyWith(page: state.page.loadingMore()));
    try {
      final page = await _repository.getNotifications(
        page: state.page.meta.currentPage + 1,
      );
      if (emit.isDone) return;
      emit(state.copyWith(page: state.page.succeeded(page)));
    } catch (error) {
      if (emit.isDone) return;
      emit(state.copyWith(page: state.page.failed(error)));
    }
  }

  Future<void> _onRetry(
    NotificationsRetryRequested event,
    Emitter<NotificationsState> emit,
  ) async {
    if (state.page.hasFailedMore) {
      await _onLoadMore(const NotificationsLoadMoreRequested(), emit);
      return;
    }
    await _loadFirst(emit);
  }

  Future<void> _onMarkRead(
    NotificationMarkReadRequested event,
    Emitter<NotificationsState> emit,
  ) async {
    if (state.markingId != null || state.isMarkingAll) return;
    final target = state.page.items.where((item) => item.id == event.id);
    if (target.isEmpty || !target.first.isUnread) return;
    emit(state.copyWith(markingId: event.id, clearError: true));
    try {
      await _repository.markRead(event.id);
      if (emit.isDone) return;
      emit(state.copyWith(clearMarking: true, page: state.page.refreshing()));
      await _fetchFirst(emit);
    } catch (error) {
      if (emit.isDone) return;
      emit(state.copyWith(clearMarking: true, error: error));
    }
  }

  Future<void> _onMarkAllRead(
    NotificationsMarkAllReadRequested event,
    Emitter<NotificationsState> emit,
  ) async {
    if (state.isMarkingAll || state.markingId != null || !state.hasUnread) {
      return;
    }
    emit(state.copyWith(isMarkingAll: true, clearError: true));
    try {
      await _repository.markAllRead();
      if (emit.isDone) return;
      emit(state.copyWith(isMarkingAll: false, page: state.page.refreshing()));
      await _fetchFirst(emit);
    } catch (error) {
      if (emit.isDone) return;
      emit(state.copyWith(isMarkingAll: false, error: error));
    }
  }

  Future<void> _loadFirst(Emitter<NotificationsState> emit) async {
    emit(state.copyWith(page: state.page.loadingFirst(), clearError: true));
    await _fetchFirst(emit);
  }

  Future<void> _fetchFirst(Emitter<NotificationsState> emit) async {
    try {
      final page = await _repository.getNotifications();
      if (emit.isDone) return;
      emit(state.copyWith(page: state.page.succeeded(page)));
    } catch (error) {
      if (emit.isDone) return;
      if (state.page.items.isNotEmpty) {
        emit(
          state.copyWith(
            page: state.page.succeeded(
              PaginatedData(data: state.page.items, meta: state.page.meta),
            ),
            error: error,
          ),
        );
      } else {
        emit(state.copyWith(page: state.page.failed(error)));
      }
    }
  }
}
