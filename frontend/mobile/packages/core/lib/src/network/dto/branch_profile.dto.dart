import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/branch_opening_hour.dto.dart';

part 'branch_profile.dto.g.dart';

/// The editable storefront texts of `GET /branch/profile` (`translations`): description and address as
/// `{en, ar}` maps, tags as a list of `{en, ar}` pairs. A language the branch never filled is absent.
class BranchProfileTextsDto {
  const BranchProfileTextsDto({
    this.description = const {},
    this.address = const {},
    this.tags = const [],
  });

  final Map<String, String> description;
  final Map<String, String> address;
  final List<Map<String, String>> tags;

  /// The backend sends an empty PHP array (a JSON list) for a text that was never set.
  factory BranchProfileTextsDto.fromJsonValue(Object? json) {
    if (json is! Map<String, dynamic>) return const BranchProfileTextsDto();
    return BranchProfileTextsDto(
      description: _texts(json['description']),
      address: _texts(json['address']),
      tags: [
        for (final tag
            in json['tags'] is List ? json['tags'] as List : const [])
          if (tag is Map) _texts(tag),
      ],
    );
  }

  static Map<String, String> _texts(Object? value) => value is Map
      ? {
          for (final entry in value.entries)
            if (entry.value is String && (entry.value as String).isNotEmpty)
              entry.key.toString(): entry.value as String,
        }
      : const {};
}

/// `GET /branch/profile`: the branch identity plus its weekly opening hours.
@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class BranchProfileDto {
  final String id;
  final String name;
  final String brandId;
  @JsonKey(defaultValue: <BranchOpeningHourDto>[])
  final List<BranchOpeningHourDto> openingHours;
  @JsonKey(fromJson: BranchProfileTextsDto.fromJsonValue)
  final BranchProfileTextsDto translations;

  const BranchProfileDto({
    required this.id,
    required this.name,
    required this.brandId,
    this.openingHours = const [],
    this.translations = const BranchProfileTextsDto(),
  });

  factory BranchProfileDto.fromJson(Map<String, dynamic> json) =>
      _$BranchProfileDtoFromJson(json);
}
