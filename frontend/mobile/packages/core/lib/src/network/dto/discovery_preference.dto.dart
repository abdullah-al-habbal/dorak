import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/client_universe.entity.dart';

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
  @JsonKey(unknownEnumValue: JsonKey.nullForUndefinedEnumValue)
  final ClientUniverse? preferredUniverse;
  final double? defaultRadius;
  final List<String> hiddenBrandIds;
  final bool showUnavailable;
  factory DiscoveryPreferenceDto.fromJson(Map<String, dynamic> json) =>
      _$DiscoveryPreferenceDtoFromJson(json);
}
