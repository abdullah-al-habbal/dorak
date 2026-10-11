import 'package:json_annotation/json_annotation.dart';

part 'discovery_preference.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class DiscoveryPreferenceDto {
  const DiscoveryPreferenceDto({
    required this.id,
    this.preferredUniverse,
    this.defaultRadius,
    this.hiddenBrandIds = const [],
    this.showUnavailable = false,
  });
  final String id;
  final String? preferredUniverse;
  final double? defaultRadius;
  final List<String> hiddenBrandIds;
  final bool showUnavailable;
  factory DiscoveryPreferenceDto.fromJson(Map<String, dynamic> json) =>
      _$DiscoveryPreferenceDtoFromJson(json);
}
