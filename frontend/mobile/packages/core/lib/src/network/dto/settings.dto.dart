import 'package:json_annotation/json_annotation.dart';

part 'settings.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class SettingsDto {
  final String? preferredLanguage;
  final bool notificationEnabled;
  final String? displayCurrencyId;
  final String? theme;
  final String? priceDisplayMode;

  const SettingsDto({
    this.preferredLanguage,
    required this.notificationEnabled,
    this.displayCurrencyId,
    this.theme,
    this.priceDisplayMode,
  });

  factory SettingsDto.fromJson(Map<String, dynamic> json) =>
      _$SettingsDtoFromJson(json);
}
