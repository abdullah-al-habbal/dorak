// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'owner_branch.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OwnerBranchDto _$OwnerBranchDtoFromJson(Map<String, dynamic> json) =>
    OwnerBranchDto(
      id: json['id'] as String,
      name: localizedMapFromJson(json['name']),
      brandId: json['brand_id'] as String,
      email: json['email'] as String?,
      status: json['status'] as String? ?? '',
      description: json['description'] == null
          ? const {}
          : localizedMapFromJson(json['description']),
      address: json['address'] == null
          ? const {}
          : localizedMapFromJson(json['address']),
      latitude: _numberFromJson(json['latitude']),
      longitude: _numberFromJson(json['longitude']),
      universe: json['universe'] as String?,
      ratingCount: (json['rating_count'] as num?)?.toInt() ?? 0,
    );
