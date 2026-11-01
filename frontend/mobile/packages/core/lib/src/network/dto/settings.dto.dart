import 'package:json_annotation/json_annotation.dart';

part 'settings.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class SettingsDto {
  final String? preferredLanguage;
  final bool isNotificationEnabled;
  final String? displayCurrencyCode;
  final String? theme;
  final String? priceDisplayMode;

  const SettingsDto({
    this.preferredLanguage,
    required this.isNotificationEnabled,
    this.displayCurrencyCode,
    this.theme,
    this.priceDisplayMode,
  });

  factory SettingsDto.fromJson(Map<String, dynamic> json) =>
      _$SettingsDtoFromJson(json);
}
