import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:client_app/src/features/profile/profile_completion.event.dart';
import 'package:client_app/src/features/profile/profile_completion.state.dart';

class ProfileCompletionBloc
    extends Bloc<ProfileCompletionEvent, ProfileCompletionState> {
  ProfileCompletionBloc(this._profiles, this._preferences)
    : super(const ProfileCompletionState()) {
    on<ProfileCompletionSubmitted>(_onSubmitted);
  }

  final ProfileRepository _profiles;
  final AppPreferences _preferences;

  Future<void> _onSubmitted(
    ProfileCompletionSubmitted event,
    Emitter<ProfileCompletionState> emit,
  ) async {
    if (state.isSubmitting) return;
    emit(const ProfileCompletionState(isSubmitting: true));
    try {
      await _profiles.updateProfile(name: event.name, phone: event.phone);
      await _preferences.setProfileCompleted(true);
      if (emit.isDone) return;
      emit(const ProfileCompletionState(completed: true));
    } catch (error) {
      if (emit.isDone) return;
      emit(ProfileCompletionState(error: error));
    }
  }
}
