import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/localized_map.entity.dart';
import 'package:core/src/network/owner_brand_status.entity.dart';

part 'owner_brand.dto.g.dart';

OwnerBrandStatus _statusFromJson(Object? value) =>
    OwnerBrandStatus.fromWire(value as String?);

/// `GET /owner/brands` and `GET /owner/brands/{brand}` (the dashboard `BrandResource`).
@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class OwnerBrandDto {
  const OwnerBrandDto({
    required this.id,
    required this.name,
    required this.status,
    this.description = const {},
    this.logoUrl,
    this.slug,
    this.universe,
    this.statusReason,
    this.submissionCount = 1,
    this.maxSubmissions = 1,
    this.branchesCount,
    this.features = const {},
  });

  final String id;
  @JsonKey(fromJson: localizedMapFromJson)
  final Map<String, String> name;
  @JsonKey(fromJson: localizedMapFromJson)
  final Map<String, String> description;
  final String? logoUrl;
  final String? slug;
  final String? universe;
  @JsonKey(fromJson: _statusFromJson)
  final OwnerBrandStatus status;

  /// Why an admin rejected or suspended the brand.
  final String? statusReason;
  @JsonKey(defaultValue: 1)
  final int submissionCount;
  @JsonKey(defaultValue: 1)
  final int maxSubmissions;
  final int? branchesCount;
  @JsonKey(defaultValue: <String, bool>{})
  final Map<String, bool> features;

  /// A rejected brand can be resubmitted until the limit is reached.
  bool get canResubmit =>
      status == OwnerBrandStatus.rejected && submissionCount < maxSubmissions;

  factory OwnerBrandDto.fromJson(Map<String, dynamic> json) =>
      _$OwnerBrandDtoFromJson(json);
}
