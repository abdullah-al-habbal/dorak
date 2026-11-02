import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

import 'package:core/src/network/client_universe.entity.dart';

part 'client.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class ClientDto extends Equatable {
  @JsonKey(defaultValue: '')
  final String id;
  @JsonKey(defaultValue: '')
  final String name;
  @JsonKey(defaultValue: '')
  final String email;
  final String? phone;
  final DateTime? phoneVerifiedAt;
  final String? avatarUrl;
  @JsonKey(unknownEnumValue: JsonKey.nullForUndefinedEnumValue)
  final ClientUniverse? preferredUniverse;
  final DateTime? emailVerifiedAt;
  final DateTime? createdAt;

  const ClientDto({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.phoneVerifiedAt,
    this.avatarUrl,
    this.preferredUniverse,
    this.emailVerifiedAt,
    this.createdAt,
  });

  factory ClientDto.fromJson(Map<String, dynamic> json) =>
      _$ClientDtoFromJson(json);

  bool get emailVerified => emailVerifiedAt != null;

  bool get phoneVerified => phoneVerifiedAt != null;

  @override
  List<Object?> get props => [
    id,
    name,
    email,
    phone,
    phoneVerifiedAt,
    avatarUrl,
    preferredUniverse,
    emailVerifiedAt,
    createdAt,
  ];
}
