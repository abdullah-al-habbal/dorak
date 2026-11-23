import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/owner/owner_branches.state.dart';

class OwnerBranchesCubit extends Cubit<OwnerBranchesState> {
  OwnerBranchesCubit(this._owner) : super(OwnerBranchesState());

  final OwnerRepository _owner;

  Future<void> load() async {
    emit(state.copyWith(loading: true, clearError: true, saved: false));
    try {
      final page = await _owner.getBranches();
      if (isClosed) return;
      emit(state.copyWith(loading: false, branches: page.data));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(loading: false, error: error));
    }
  }

  /// Opens or closes a branch, then reloads the list so the screen shows the real status.
  Future<void> switchBranch(String id, {required bool on}) async {
    emit(state.copyWith(clearError: true));
    try {
      await _owner.switchBranch(id, on: on);
      await load();
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(error: error));
    }
  }

  /// Creates a branch, or updates [id] when given. A blank [password] keeps the old one.
  Future<void> save({
    String? id,
    required String brandId,
    required String nameEn,
    required String nameAr,
    required String email,
    String? password,
  }) async {
    if (state.isSaving) return;
    emit(state.copyWith(isSaving: true, saved: false, clearError: true));
    final name = {LocaleCodes.english: nameEn, LocaleCodes.arabic: nameAr};
    final secret = password == null || password.isEmpty ? null : password;
    try {
      if (id == null) {
        await _owner.createBranch(
          brandId: brandId,
          name: name,
          email: email,
          password: secret ?? '',
        );
      } else {
        await _owner.updateBranch(
          id,
          brandId: brandId,
          name: name,
          email: email,
          password: secret,
        );
      }
      if (isClosed) return;
      emit(state.copyWith(isSaving: false, saved: true));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(isSaving: false, error: error));
    }
  }
}
