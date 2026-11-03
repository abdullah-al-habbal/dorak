import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:stylist_app/src/features/inbox/stylist_inbox.state.dart';

/// The notification feed (`/notifications`) shown as the app's inbox.
class StylistInboxBloc extends Cubit<StylistInboxState> {
  StylistInboxBloc(this._repository) : super(const StylistInboxState());

  final NotificationRepository _repository;

  Future<void> load() async {
    if (state.page.isBusy) return;
    emit(
      state.copyWith(
        page: state.page.items.isEmpty
            ? state.page.loadingFirst()
            : state.page.refreshing(),
        clearError: true,
      ),
    );
    try {
      final page = await _repository.getNotifications();
      if (isClosed) return;
      emit(state.copyWith(page: state.page.succeeded(page)));
    } catch (error) {
      if (isClosed) return;
      emit(
        state.page.items.isEmpty
            ? state.copyWith(page: state.page.failed(error))
            : state.copyWith(
                page: state.page.succeeded(
                  PaginatedData(data: state.page.items, meta: state.page.meta),
                ),
                error: error,
              ),
      );
    }
  }

  Future<void> loadMore() async {
    if (!state.page.hasMore || state.page.isBusy) return;
    emit(state.copyWith(page: state.page.loadingMore()));
    try {
      final page = await _repository.getNotifications(
        page: state.page.meta.currentPage + 1,
      );
      if (isClosed) return;
      emit(state.copyWith(page: state.page.succeeded(page)));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(page: state.page.failed(error)));
    }
  }

  Future<void> markRead(String id) async {
    final target = state.page.items.where((item) => item.id == id);
    if (state.marking || target.isEmpty || !target.first.isUnread) return;
    await _mark(() => _repository.markRead(id));
  }

  Future<void> markAllRead() async {
    if (state.marking || state.unreadCount == 0) return;
    await _mark(_repository.markAllRead);
  }

  Future<void> _mark(Future<void> Function() action) async {
    emit(state.copyWith(marking: true, clearError: true));
    try {
      await action();
      if (isClosed) return;
      emit(state.copyWith(marking: false));
      await load();
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(marking: false, error: error));
    }
  }
}
