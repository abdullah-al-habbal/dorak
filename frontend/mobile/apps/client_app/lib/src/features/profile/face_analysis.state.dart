import 'package:equatable/equatable.dart';
import 'package:core/core.dart';
import 'package:client_app/src/features/profile/face_analysis_constants.entity.dart';

// todo: we must rename the enum of FaceAnalysisStatus into FaceAnalysisStatusEnum and update all the references to it in the codebase.
enum FaceAnalysisStatus { initial, loading, ready, degraded, uploading, failed }

class FaceAnalysisState extends Equatable {
  FaceAnalysisState({
    this.status = FaceAnalysisStatus.initial,
    this.latest,
    this.uploadedPhotoUrl,
    this.faceProfileId,
    this.analysisFailed = false,
    List<CatalogItemDto> curated = const [],
    this.awaitingAnalysis = false,
    this.error,
    this.catalogError,
    List<FacePhotoDto> photos = const [],
    this.photoLimitReached = false,
  }) : curated = List.unmodifiable(curated),
       photos = List.unmodifiable(photos);

  final FaceAnalysisStatus status;
  final FaceAnalysisResultDto? latest;
  final String? uploadedPhotoUrl;
  final String? faceProfileId;
  final bool analysisFailed;
  final List<CatalogItemDto> curated;
  final bool awaitingAnalysis;
  final Object? error;
  final Object? catalogError;
  final List<FacePhotoDto> photos;
  final bool photoLimitReached;

  bool get atPhotoLimit => photos.length >= FaceAnalysisConstants.maxPhotos;

  FaceAnalysisState copyWith({
    FaceAnalysisStatus? status,
    FaceAnalysisResultDto? latest,
    bool clearLatest = false,
    String? uploadedPhotoUrl,
    bool clearUploadedPhotoUrl = false,
    String? faceProfileId,
    bool clearFaceProfileId = false,
    List<CatalogItemDto>? curated,
    bool clearCurated = false,
    bool? awaitingAnalysis,
    bool? analysisFailed,
    Object? error,
    bool clearError = false,
    Object? catalogError,
    bool clearCatalogError = false,
    List<FacePhotoDto>? photos,
    bool? photoLimitReached,
  }) {
    return FaceAnalysisState(
      status: status ?? this.status,
      latest: clearLatest ? null : latest ?? this.latest,
      uploadedPhotoUrl: clearUploadedPhotoUrl
          ? null
          : uploadedPhotoUrl ?? this.uploadedPhotoUrl,
      faceProfileId: clearFaceProfileId
          ? null
          : faceProfileId ?? this.faceProfileId,
      curated: clearCurated ? const [] : curated ?? this.curated,
      awaitingAnalysis: awaitingAnalysis ?? this.awaitingAnalysis,
      analysisFailed: analysisFailed ?? this.analysisFailed,
      error: clearError ? null : error ?? this.error,
      catalogError: clearCatalogError
          ? null
          : catalogError ?? this.catalogError,
      photos: photos ?? this.photos,
      photoLimitReached: photoLimitReached ?? this.photoLimitReached,
    );
  }

  @override
  List<Object?> get props => [
    status,
    latest,
    uploadedPhotoUrl,
    faceProfileId,
    analysisFailed,
    curated,
    awaitingAnalysis,
    error,
    catalogError,
    photos,
    photoLimitReached,
  ];
}
