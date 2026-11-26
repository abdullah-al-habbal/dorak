import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/dto/localized_map.entity.dart';
import 'package:core/src/network/owner_brand_status.entity.dart';

part 'owner_profile.dto.g.dart';

OwnerBrandStatus _statusFromJson(Object? value) =>
    OwnerBrandStatus.fromWire(value as String?);

/// One brand in `GET /owner/me`, enough for the approval banners.
@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class OwnerBrandSummaryDto {
  const OwnerBrandSummaryDto({
    required this.id,
    required this.name,
    required this.status,
  });

  final String id;
  @JsonKey(fromJson: localizedMapFromJson)
  final Map<String, String> name;
  @JsonKey(fromJson: _statusFromJson)
  final OwnerBrandStatus status;

  factory OwnerBrandSummaryDto.fromJson(Map<String, dynamic> json) =>
      _$OwnerBrandSummaryDtoFromJson(json);
}

/// `GET /owner/me`: whether this client owns a brand, and which.
@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class OwnerProfileDto {
  const OwnerProfileDto({
    this.clientId,
    this.isOwner = false,
    this.brandIds = const [],
    this.branchCount = 0,
    this.brands = const [],
  });

  /// The owner's private realtime channel is `client.{clientId}`. Null from a
  /// backend that does not send it yet.
  final String? clientId;
  @JsonKey(defaultValue: false)
  final bool isOwner;
  @JsonKey(defaultValue: <String>[])
  final List<String> brandIds;
  @JsonKey(defaultValue: 0)
  final int branchCount;
  @JsonKey(defaultValue: <OwnerBrandSummaryDto>[])
  final List<OwnerBrandSummaryDto> brands;

  factory OwnerProfileDto.fromJson(Map<String, dynamic> json) =>
      _$OwnerProfileDtoFromJson(json);
}
