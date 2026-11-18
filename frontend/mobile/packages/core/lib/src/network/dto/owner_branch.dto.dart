import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/localized_map.entity.dart';

part 'owner_branch.dto.g.dart';

/// `GET /owner/branches` and `GET /owner/branches/{branch}` (`BranchResource`).
/// [status] stays a string (`enabled`, `disabled`, `pending`, `suspended`): a value
/// added by the backend later must not break the list.
@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class OwnerBranchDto {
  const OwnerBranchDto({
    required this.id,
    required this.name,
    required this.brandId,
    this.email,
    this.status = '',
    this.description = const {},
    this.address = const {},
    this.latitude,
    this.longitude,
    this.universe,
    this.ratingCount = 0,
  });

  final String id;
  @JsonKey(fromJson: localizedMapFromJson)
  final Map<String, String> name;
  final String brandId;
  final String? email;
  @JsonKey(defaultValue: '')
  final String status;
  @JsonKey(fromJson: localizedMapFromJson)
  final Map<String, String> description;
  @JsonKey(fromJson: localizedMapFromJson)
  final Map<String, String> address;
  @JsonKey(fromJson: _numberFromJson)
  final double? latitude;
  @JsonKey(fromJson: _numberFromJson)
  final double? longitude;
  final String? universe;
  @JsonKey(defaultValue: 0)
  final int ratingCount;

  bool get isEnabled => status == 'enabled';

  factory OwnerBranchDto.fromJson(Map<String, dynamic> json) =>
      _$OwnerBranchDtoFromJson(json);
}

/// Decimals arrive as strings (`"33.5"`) or numbers.
double? _numberFromJson(Object? value) => switch (value) {
  num() => value.toDouble(),
  String() => double.tryParse(value),
  _ => null,
};
