// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'staff_member.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StaffMemberDto _$StaffMemberDtoFromJson(Map<String, dynamic> json) =>
    StaffMemberDto(
      id: json['id'] as String,
      name: json['name'] as String,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      status:
          $enumDecodeNullable(
            _$BarberStatusEnumMap,
            json['status'],
            unknownValue: BarberStatus.pending,
          ) ??
          BarberStatus.pending,
      ratingAverage: (json['rating_average'] as num?)?.toDouble(),
      ratingCount: (json['rating_count'] as num?)?.toInt() ?? 0,
      hasLogin: json['has_login'] as bool? ?? false,
    );

const _$BarberStatusEnumMap = {
  BarberStatus.pending: 'pending',
  BarberStatus.enabled: 'enabled',
  BarberStatus.disabled: 'disabled',
  BarberStatus.rejected: 'rejected',
};
