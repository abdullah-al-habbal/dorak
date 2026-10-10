import 'package:core/core.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProfileEditState extends Equatable {
  const ProfileEditState({
    this.isSaving = false,
    this.saved = false,
    this.error,
  });

  final bool isSaving;
  final bool saved;
  final Object? error;

  @override
  List<Object?> get props => [isSaving, saved, error];
}

class ProfileEditCubit extends Cubit<ProfileEditState> {
  ProfileEditCubit(this._repository) : super(const ProfileEditState());

  final ProfileRepository _repository;

  Future<void> save({required String name, required String phone}) async {
    if (state.isSaving) return;
    emit(const ProfileEditState(isSaving: true));
    try {
      await _repository.updateProfile(name: name, phone: phone);
      if (!isClosed) emit(const ProfileEditState(saved: true));
    } catch (error) {
      if (!isClosed) emit(ProfileEditState(error: error));
    }
  }
}
