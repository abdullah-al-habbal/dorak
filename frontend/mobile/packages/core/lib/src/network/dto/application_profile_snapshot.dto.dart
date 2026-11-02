import 'package:core/src/network/dto/application_snapshot_photo.dto.dart';
import 'package:core/src/network/dto/application_snapshot_rating.dto.dart';
import 'package:core/src/network/dto/application_snapshot_service.dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'application_profile_snapshot.dto.g.dart';

/// An immutable copy of the applying barber's profile, taken at apply time
/// (Task 56): editing the profile afterward never changes this snapshot.
@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class ApplicationProfileSnapshotDto {
  final String name;
  final String email;
  final String? bio;
  final bool isFreelancer;
  final double? travelRadiusKm;
  final ApplicationSnapshotRatingDto? rating;
  final List<ApplicationSnapshotPhotoDto> portfolio;
  final List<ApplicationSnapshotServiceDto> services;

  const ApplicationProfileSnapshotDto({
    required this.name,
    required this.email,
    this.bio,
    this.isFreelancer = false,
    this.travelRadiusKm,
    this.rating,
    this.portfolio = const [],
    this.services = const [],
  });

  factory ApplicationProfileSnapshotDto.fromJson(Map<String, dynamic> json) =>
      _$ApplicationProfileSnapshotDtoFromJson(json);
}
