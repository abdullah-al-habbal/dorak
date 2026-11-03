import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:stylist_app/src/features/profile/stylist_profile.state.dart';

class StylistProfileBloc extends Cubit<StylistProfileState> {
  StylistProfileBloc(this._repository) : super(const StylistProfileState());

  final StylistOperationsRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(loading: true, saved: false, clearError: true));
    try {
      final profile = await _repository.getProfile();
      if (isClosed) return;
      emit(
        state.copyWith(
          loading: false,
          profile: profile,
          travelRadiusKm: profile.travelRadiusKm ?? 0,
        ),
      );
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  void setTravelRadius(double value) =>
      emit(state.copyWith(travelRadiusKm: value, saved: false));

  /// Saves the radius and any non-empty bio locale; a blank locale is left
  /// untouched on the backend rather than cleared.
  Future<void> save({String bioEnglish = '', String bioArabic = ''}) async {
    if (state.saving) return;
    emit(state.copyWith(saving: true, saved: false, clearError: true));
    try {
      final bio = {
        if (bioEnglish.trim().isNotEmpty) 'en': bioEnglish.trim(),
        if (bioArabic.trim().isNotEmpty) 'ar': bioArabic.trim(),
      };
      if (bio.isNotEmpty) await _repository.updateProfile(bio: bio);
      final profile = await _repository.updateTravelRadius(
        state.travelRadiusKm,
      );
      if (isClosed) return;
      emit(state.copyWith(saving: false, saved: true, profile: profile));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(saving: false, error: error));
    }
  }
}
