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
  preferredUniverse: json['preferred_universe'] as String?,
  emailVerified: json['email_verified'] as bool? ?? true,
);
