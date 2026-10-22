import 'package:core/core.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProfileEditState extends Equatable {
  const ProfileEditState({
    this.isSaving = false,
    this.saved = false,
    this.client,
    this.needsEmailVerification = false,
    this.error,
  });

  final bool isSaving;
  final bool saved;
  final ClientDto? client;
  final bool needsEmailVerification;
  final Object? error;

  @override
  List<Object?> get props => [
    isSaving,
    saved,
    client,
    needsEmailVerification,
    error,
  ];
}

class ProfileEditCubit extends Cubit<ProfileEditState> {
  ProfileEditCubit(this._repository, {this.initialEmail = ''})
    : super(const ProfileEditState());

  final ProfileRepository _repository;
  final String initialEmail;

  Future<void> save({
    required String name,
    required String phone,
    String? email,
  }) async {
    if (state.isSaving) return;
    emit(const ProfileEditState(isSaving: true));
    final trimmed = email?.trim();
    final emailChanged =
        trimmed != null &&
        trimmed.isNotEmpty &&
        trimmed.toLowerCase() != initialEmail.trim().toLowerCase();
    try {
      final client = await _repository.updateProfile(
        name: name,
        phone: phone,
        email: emailChanged ? trimmed : null,
      );
      if (isClosed) return;
      emit(
        ProfileEditState(
          saved: true,
          client: client,
          needsEmailVerification: emailChanged && !client.emailVerified,
        ),
      );
    } catch (error) {
      if (!isClosed) emit(ProfileEditState(error: error));
    }
  }
}
