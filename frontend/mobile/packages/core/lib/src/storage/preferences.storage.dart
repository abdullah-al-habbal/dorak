import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:core/src/storage/preferences_storage_keys.entity.dart';

class SavedAddress {
  const SavedAddress({
    required this.street,
    required this.building,
    required this.unit,
    required this.latitude,
    required this.longitude,
  });

  final String street;
  final String building;
  final String unit;
  final double latitude;
  final double longitude;

  String get label => '$street, $building, $unit';

  Map<String, Object> toJson() => {
    'street': street,
    'building': building,
    'unit': unit,
    'latitude': latitude,
    'longitude': longitude,
  };

  static SavedAddress? fromJson(Object? value) {
    if (value is! Map<String, dynamic>) return null;
    final street = value['street'];
    final building = value['building'];
    final unit = value['unit'];
    final latitude = value['latitude'];
    final longitude = value['longitude'];
    if (street is! String ||
        building is! String ||
        unit is! String ||
        latitude is! num ||
        longitude is! num) {
      return null;
    }
    return SavedAddress(
      street: street,
      building: building,
      unit: unit,
      latitude: latitude.toDouble(),
      longitude: longitude.toDouble(),
    );
  }
}

abstract class AppPreferences {
  bool get dontShowOnboarding;

  bool get profileCompleted;

  List<SavedAddress> get savedAddresses;

  Future<void> setDontShowOnboarding(bool value);

  Future<void> setProfileCompleted(bool value);

  Future<void> saveAddress(SavedAddress address);

  Future<void> replaceAddress(SavedAddress previous, SavedAddress address);

  Future<void> deleteAddress(SavedAddress address);
}

class SharedAppPreferences implements AppPreferences {
  final SharedPreferences _prefs;

  const SharedAppPreferences(this._prefs);

  static Future<SharedAppPreferences> create() async {
    return SharedAppPreferences(await SharedPreferences.getInstance());
  }

  @override
  bool get dontShowOnboarding =>
      _prefs.getBool(PreferencesStorageKeys.preferencesDontShowOnboardingKey) ??
      false;

  @override
  bool get profileCompleted =>
      _prefs.getBool(PreferencesStorageKeys.preferencesProfileCompletedKey) ??
      false;

  @override
  List<SavedAddress> get savedAddresses {
    final raw = _prefs.getString(
      PreferencesStorageKeys.preferencesSavedAddressesKey,
    );
    if (raw == null) return const [];
    try {
      final decoded = jsonDecode(raw);
      if (decoded is! List) return const [];
      return decoded
          .map(SavedAddress.fromJson)
          .whereType<SavedAddress>()
          .toList(growable: false);
    } on FormatException {
      return const [];
    }
  }

  @override
  Future<void> setDontShowOnboarding(bool value) => _prefs.setBool(
    PreferencesStorageKeys.preferencesDontShowOnboardingKey,
    value,
  );

  @override
  Future<void> setProfileCompleted(bool value) => _prefs.setBool(
    PreferencesStorageKeys.preferencesProfileCompletedKey,
    value,
  );

  @override
  Future<void> saveAddress(SavedAddress address) async {
    final saved = savedAddresses.where((item) => item.label != address.label);
    await _prefs.setString(
      PreferencesStorageKeys.preferencesSavedAddressesKey,
      jsonEncode([address.toJson(), ...saved.map((item) => item.toJson())]),
    );
  }

  @override
  Future<void> replaceAddress(SavedAddress previous, SavedAddress address) {
    final saved = savedAddresses.where((item) => item.label != previous.label);
    return _writeAddresses([address, ...saved]);
  }

  @override
  Future<void> deleteAddress(SavedAddress address) {
    return _writeAddresses(
      savedAddresses.where((item) => item.label != address.label),
    );
  }

  Future<void> _writeAddresses(Iterable<SavedAddress> addresses) =>
      _prefs.setString(
        PreferencesStorageKeys.preferencesSavedAddressesKey,
        jsonEncode(addresses.map((item) => item.toJson()).toList()),
      );
}
