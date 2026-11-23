import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/profile/business_profile.state.dart';

class BusinessProfileBloc extends Cubit<BusinessProfileState> {
  BusinessProfileBloc(this._repository, this._hours)
    : super(const BusinessProfileState());

  final BranchManagementRepository _repository;
  final BranchHoursRepository _hours;

  /// Loads the stored texts so the form shows them and a save keeps what the owner did not touch.
  Future<void> load() async {
    try {
      final profile = await _hours.getProfile();
      if (isClosed) return;
      emit(state.copyWith(texts: profile.translations, clearError: true));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(error: error));
    }
  }

  /// Sends only the filled fields; the backend leaves omitted ones untouched. Once the stored texts
  /// are loaded an emptied tag field clears the tags; before that an empty field sends nothing.
  Future<void> save({
    String descriptionEnglish = '',
    String descriptionArabic = '',
    String addressEnglish = '',
    String addressArabic = '',
    String tagsEnglish = '',
    String tagsArabic = '',
  }) async {
    if (state.saving) return;
    emit(state.copyWith(saving: true, saved: false, clearError: true));
    try {
      final description = _localized(descriptionEnglish, descriptionArabic);
      final address = _localized(addressEnglish, addressArabic);
      final tagList = _tagPairs(tagsEnglish, tagsArabic);
      await _repository.updateProfile(
        description: description.isEmpty ? null : description,
        address: address.isEmpty ? null : address,
        tags: tagList.isEmpty && state.texts == null ? null : tagList,
      );
      if (isClosed) return;
      emit(state.copyWith(saving: false, saved: true));
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(saving: false, error: error));
    }
  }

  Map<String, String> _localized(String english, String arabic) => {
    if (english.trim().isNotEmpty) LocaleCodes.english: english.trim(),
    if (arabic.trim().isNotEmpty) LocaleCodes.arabic: arabic.trim(),
  };

  /// Pairs the comma separated English and Arabic tags by position. A tag
  /// missing in one language reuses the other, so each pair is complete.
  List<Map<String, String>> _tagPairs(String english, String arabic) {
    List<String> split(String text) => text
        .split(',')
        .map((tag) => tag.trim())
        .where((tag) => tag.isNotEmpty)
        .toList();
    final en = split(english);
    final ar = split(arabic);
    final count = en.length > ar.length ? en.length : ar.length;
    return [
      for (var i = 0; i < count; i++)
        {
          LocaleCodes.english: i < en.length ? en[i] : ar[i],
          LocaleCodes.arabic: i < ar.length ? ar[i] : en[i],
        },
    ];
  }
}
