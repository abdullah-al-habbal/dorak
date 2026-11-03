import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:stylist_app/src/features/history/stylist_client_history.state.dart';
import 'package:stylist_app/src/features/history/stylist_client_history_constants.entity.dart';
import 'package:stylist_app/src/features/portfolio/photo_picker.provider.dart';

class StylistClientHistoryBloc extends Cubit<StylistClientHistoryState> {
  StylistClientHistoryBloc(this._history, this._picker, this._barberId)
    : super(StylistClientHistoryState());

  final BarberHistoryRepository _history;
  final PhotoPicker _picker;
  final String? Function() _barberId;

  /// Whether the signed-in stylist performed [visit]. The backend refuses
  /// media for anyone else's visit (403), so the UI only offers it here.
  bool canAttachTo(ServiceHistoryDto visit) {
    final barberId = _barberId();
    return barberId != null && visit.barber?.id == barberId;
  }

  /// Loads the client's visits. Switching client clears the previous list.
  Future<void> load(String clientId) async {
    final switched = state.clientId != clientId;
    emit(
      state.copyWith(
        clientId: clientId,
        loading: true,
        clearError: true,
        visits: switched ? const [] : null,
      ),
    );
    try {
      final page = await _history.getClientHistory(
        clientId,
        perPage: StylistClientHistoryConstants.pageSize,
      );
      if (isClosed) return;
      emit(state.copyWith(loading: false, visits: page.data));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  /// Picks a photo and attaches it to [historyId] tagged [photoType]. Returns
  /// whether a photo was uploaded; cancelling the picker is not an error.
  Future<bool> attachPhoto(String historyId, String photoType) async {
    final clientId = state.clientId;
    if (clientId == null || state.uploadingId != null) return false;
    final path = await _picker.pickPhoto();
    if (path == null || isClosed) return false;
    emit(state.copyWith(uploadingId: historyId, clearError: true));
    try {
      final media = await _history.attachMedia(
        historyId: historyId,
        photoPath: path,
        photoType: photoType,
      );
      if (isClosed) return false;
      emit(
        state.copyWith(
          clearUploading: true,
          visits: [
            for (final visit in state.visits)
              if (visit.id == historyId) _withMedia(visit, media) else visit,
          ],
        ),
      );
      return true;
    } catch (error) {
      if (isClosed) return false;
      emit(state.copyWith(clearUploading: true, error: error));
      return false;
    }
  }

  ServiceHistoryDto _withMedia(
    ServiceHistoryDto visit,
    HistoryMediaDto media,
  ) => ServiceHistoryDto(
    id: visit.id,
    bookingId: visit.bookingId,
    catalogItemId: visit.catalogItemId,
    performedAt: visit.performedAt,
    clientRating: visit.clientRating,
    clientNotes: visit.clientNotes,
    barber: visit.barber,
    branch: visit.branch,
    catalogItem: visit.catalogItem,
    media: [...visit.media, media],
    createdAt: visit.createdAt,
  );
}
