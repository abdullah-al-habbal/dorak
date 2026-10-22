// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'client.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ClientDto _$ClientDtoFromJson(Map<String, dynamic> json) => ClientDto(
  id: json['id'] as String? ?? '',
  name: json['name'] as String? ?? '',
  email: json['email'] as String? ?? '',
  phone: json['phone'] as String?,
  phoneVerifiedAt: json['phone_verified_at'] == null
      ? null
      : DateTime.parse(json['phone_verified_at'] as String),
  avatar: json['avatar'] as String?,
  preferredUniverse: json['preferred_universe'] as String?,
  emailVerifiedAt: json['email_verified_at'] == null
      ? null
      : DateTime.parse(json['email_verified_at'] as String),
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
);
