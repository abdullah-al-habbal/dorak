import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/client_universe.entity.dart';

part 'universe_preference.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class UniversePreferenceDto {
  @JsonKey(unknownEnumValue: JsonKey.nullForUndefinedEnumValue)
  final ClientUniverse? preferredUniverse;

  const UniversePreferenceDto({this.preferredUniverse});

  factory UniversePreferenceDto.fromJson(Map<String, dynamic> json) =>
      _$UniversePreferenceDtoFromJson(json);
}
