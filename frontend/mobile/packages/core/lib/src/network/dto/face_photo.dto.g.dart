// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'face_photo.dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FacePhotoDto _$FacePhotoDtoFromJson(Map<String, dynamic> json) => FacePhotoDto(
  id: json['id'] as String,
  imageUrl: json['image_url'] as String,
  isPrimary: json['is_primary'] as bool? ?? false,
  analysisStatus: $enumDecodeNullable(
    _$FaceProfileAnalysisStatusEnumMap,
    json['analysis_status'],
    unknownValue: JsonKey.nullForUndefinedEnumValue,
  ),
  uploadedAt: json['uploaded_at'] == null
      ? null
      : DateTime.parse(json['uploaded_at'] as String),
);

const _$FaceProfileAnalysisStatusEnumMap = {
  FaceProfileAnalysisStatus.pending: 'pending',
  FaceProfileAnalysisStatus.completed: 'completed',
  FaceProfileAnalysisStatus.failed: 'failed',
};
