// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'owner_profile.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OwnerBrandSummaryDto _$OwnerBrandSummaryDtoFromJson(
  Map<String, dynamic> json,
) => OwnerBrandSummaryDto(
  id: json['id'] as String,
  name: localizedMapFromJson(json['name']),
  status: _statusFromJson(json['status']),
);

OwnerProfileDto _$OwnerProfileDtoFromJson(
  Map<String, dynamic> json,
) => OwnerProfileDto(
  isOwner: json['is_owner'] as bool? ?? false,
  brandIds:
      (json['brand_ids'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      [],
  branchCount: (json['branch_count'] as num?)?.toInt() ?? 0,
  brands:
      (json['brands'] as List<dynamic>?)
          ?.map((e) => OwnerBrandSummaryDto.fromJson(e as Map<String, dynamic>))
          .toList() ??
      [],
);
