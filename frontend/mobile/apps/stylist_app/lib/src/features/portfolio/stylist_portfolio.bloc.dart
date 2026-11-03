import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:stylist_app/src/features/portfolio/photo_picker.provider.dart';
import 'package:stylist_app/src/features/portfolio/stylist_portfolio.state.dart';

class StylistPortfolioBloc extends Cubit<StylistPortfolioState> {
  StylistPortfolioBloc(this._repository, this._picker)
    : super(StylistPortfolioState());

  final StylistOperationsRepository _repository;
  final PhotoPicker _picker;

  Future<void> load() async {
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final photos = await _repository.getPortfolio();
      if (isClosed) return;
      emit(state.copyWith(loading: false, photos: photos));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  Future<void> addPhoto() async {
    if (state.uploading) return;
    final path = await _picker.pickPhoto();
    if (path == null || isClosed) return;
    emit(state.copyWith(uploading: true, clearError: true));
    try {
      final photo = await _repository.uploadPortfolioPhoto(path);
      if (isClosed) return;
      emit(state.copyWith(uploading: false, photos: [...state.photos, photo]));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(uploading: false, error: error));
    }
  }

  Future<void> deletePhoto(String id) async {
    if (state.deletingId != null) return;
    emit(state.copyWith(deletingId: id, clearError: true));
    try {
      await _repository.deletePortfolioPhoto(id);
      if (isClosed) return;
      emit(
        state.copyWith(
          clearDeleting: true,
          photos: state.photos.where((photo) => photo.id != id).toList(),
        ),
      );
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(clearDeleting: true, error: error));
    }
  }
}
