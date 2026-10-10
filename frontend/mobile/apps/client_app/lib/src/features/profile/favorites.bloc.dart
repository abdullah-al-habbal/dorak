import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class FavoritesBloc extends Cubit<Paged<ClientFavoriteDto>> {
  FavoritesBloc(this._repository) : super(const Paged.initial());

  final FavoriteRepository _repository;

  Future<void> load() async {
    if (state.isBusy) return;
    emit(state.loadingFirst());
    try {
      emit(state.succeeded(await _repository.getFavorites()));
    } catch (error) {
      emit(state.failed(error));
    }
  }

  Future<void> remove(String favoriteId) async {
    try {
      await _repository.removeFavorite(favoriteId);
      emit(state.succeeded(await _repository.getFavorites()));
    } catch (error) {
      emit(state.failed(error));
    }
  }

  Future<void> add({
    required String favorableId,
    required String favorableType,
  }) async {
    try {
      await _repository.addFavorite(
        favorableId: favorableId,
        favorableType: favorableType,
      );
      if (!isClosed) await load();
    } catch (error) {
      if (!isClosed) emit(state.failed(error));
    }
  }
}
