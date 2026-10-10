import 'package:equatable/equatable.dart';
import 'package:core/core.dart';

// todo: we must rename the enum of FaceAnalysisStatus into FaceAnalysisStatusEnum and update all the references to it in the codebase.
enum FaceAnalysisStatus { initial, loading, ready, degraded, uploading, failed }

class FaceAnalysisState extends Equatable {
  FaceAnalysisState({
    this.status = FaceAnalysisStatus.initial,
    this.latest,
    this.uploadedPhotoUrl,
    List<CatalogItemDto> curated = const [],
    this.awaitingAnalysis = false,
    this.error,
    this.catalogError,
  }) : curated = List.unmodifiable(curated);

  final FaceAnalysisStatus status;
  final FaceAnalysisResultDto? latest;
  final String? uploadedPhotoUrl;
  final List<CatalogItemDto> curated;
  final bool awaitingAnalysis;
  final Object? error;
  final Object? catalogError;

  FaceAnalysisState copyWith({
    FaceAnalysisStatus? status,
    FaceAnalysisResultDto? latest,
    bool clearLatest = false,
    String? uploadedPhotoUrl,
    bool clearUploadedPhotoUrl = false,
    List<CatalogItemDto>? curated,
    bool clearCurated = false,
    bool? awaitingAnalysis,
    Object? error,
    bool clearError = false,
    Object? catalogError,
    bool clearCatalogError = false,
  }) {
    return FaceAnalysisState(
      status: status ?? this.status,
      latest: clearLatest ? null : latest ?? this.latest,
      uploadedPhotoUrl: clearUploadedPhotoUrl
          ? null
          : uploadedPhotoUrl ?? this.uploadedPhotoUrl,
      curated: clearCurated ? const [] : curated ?? this.curated,
      awaitingAnalysis: awaitingAnalysis ?? this.awaitingAnalysis,
      error: clearError ? null : error ?? this.error,
      catalogError: clearCatalogError
          ? null
          : catalogError ?? this.catalogError,
    );
  }

  @override
  List<Object?> get props => [
    status,
    latest,
    uploadedPhotoUrl,
    curated,
    awaitingAnalysis,
    error,
    catalogError,
  ];
}
