import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/profile/business_profile.state.dart';

class BusinessProfileBloc extends Cubit<BusinessProfileState> {
  BusinessProfileBloc(this._repository) : super(const BusinessProfileState());

  final BranchManagementRepository _repository;

  /// Sends only the filled fields; the backend leaves omitted ones untouched.
  Future<void> save({
    String descriptionEnglish = '',
    String descriptionArabic = '',
    String addressEnglish = '',
    String addressArabic = '',
    String tags = '',
  }) async {
    if (state.saving) return;
    emit(state.copyWith(saving: true, saved: false, clearError: true));
    try {
      final description = _localized(descriptionEnglish, descriptionArabic);
      final address = _localized(addressEnglish, addressArabic);
      final tagList = tags
          .split(',')
          .map((tag) => tag.trim())
          .where((tag) => tag.isNotEmpty)
          .toList();
      await _repository.updateProfile(
        description: description.isEmpty ? null : description,
        address: address.isEmpty ? null : address,
        tags: tagList.isEmpty ? null : tagList,
      );
      if (isClosed) return;
      emit(state.copyWith(saving: false, saved: true));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(saving: false, error: error));
    }
  }

  Map<String, String> _localized(String english, String arabic) => {
    if (english.trim().isNotEmpty) 'en': english.trim(),
    if (arabic.trim().isNotEmpty) 'ar': arabic.trim(),
  };
}
