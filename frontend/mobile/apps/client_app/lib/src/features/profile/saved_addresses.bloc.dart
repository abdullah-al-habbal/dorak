import 'package:core/core.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class SavedAddressesState extends Equatable {
  SavedAddressesState({
    required List<SavedAddress> addresses,
    this.isSaving = false,
    this.error,
  }) : addresses = List.unmodifiable(addresses);

  final List<SavedAddress> addresses;
  final bool isSaving;
  final Object? error;

  @override
  List<Object?> get props => [addresses, isSaving, error];
}

class SavedAddressesCubit extends Cubit<SavedAddressesState> {
  SavedAddressesCubit(this._preferences)
    : super(SavedAddressesState(addresses: _preferences.savedAddresses));

  final AppPreferences _preferences;

  Future<void> save(SavedAddress address, {SavedAddress? previous}) async {
    emit(SavedAddressesState(addresses: state.addresses, isSaving: true));
    try {
      if (previous == null) {
        await _preferences.saveAddress(address);
      } else {
        await _preferences.replaceAddress(previous, address);
      }
      if (!isClosed) _reload();
    } catch (error) {
      if (!isClosed) {
        emit(SavedAddressesState(addresses: state.addresses, error: error));
      }
    }
  }

  Future<void> delete(SavedAddress address) async {
    emit(SavedAddressesState(addresses: state.addresses, isSaving: true));
    try {
      await _preferences.deleteAddress(address);
      if (!isClosed) _reload();
    } catch (error) {
      if (!isClosed) {
        emit(SavedAddressesState(addresses: state.addresses, error: error));
      }
    }
  }

  void _reload() =>
      emit(SavedAddressesState(addresses: _preferences.savedAddresses));
}
