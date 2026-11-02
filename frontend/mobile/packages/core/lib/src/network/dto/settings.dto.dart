import 'package:json_annotation/json_annotation.dart';

part 'settings.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class SettingsDto {
  final String? preferredLanguage;
  final bool allowsNotifications;
  final String? displayCurrencyCode;
  final String? themeMode;
  final String? priceDisplayMode;

  const SettingsDto({
    this.preferredLanguage,
    required this.allowsNotifications,
    this.displayCurrencyCode,
    this.themeMode,
    this.priceDisplayMode,
  });

  factory SettingsDto.fromJson(Map<String, dynamic> json) =>
      _$SettingsDtoFromJson(json);
}
