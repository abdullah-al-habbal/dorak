import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:client_app/src/features/profile/face_analysis.event.dart';
import 'package:client_app/src/features/profile/face_analysis.state.dart';

class FaceAnalysisBloc extends Bloc<FaceAnalysisEvent, FaceAnalysisState> {
  FaceAnalysisBloc(
    this._faceProfile,
    this._catalog, {
    Future<void> Function(Duration)? wait,
  }) : _wait = wait ?? Future<void>.delayed,
       super(FaceAnalysisState()) {
    on<FaceAnalysisStarted>(_onStarted);
    on<FaceAnalysisPhotoScanned>(_onPhotoScanned);
    on<FaceAnalysisCheckedAgain>(_onCheckedAgain);
    on<FaceAnalysisPhotoDeleted>(_onPhotoDeleted);
    on<FaceAnalysisPhotoSetPrimary>(_onPhotoSetPrimary);
  }

  static const int _maxCatalogPages = 5;
  static const List<Duration> _analysisPollDelays = [
    Duration(seconds: 1),
    Duration(seconds: 2),
    Duration(seconds: 4),
  ];

  final FaceProfileRepository _faceProfile;
  final ServiceCatalogRepository _catalog;
  final Future<void> Function(Duration) _wait;

  Future<void> _onStarted(
    FaceAnalysisStarted event,
    Emitter<FaceAnalysisState> emit,
  ) async {
    if (state.status != FaceAnalysisStatus.initial) return;
    await _load(emit);
  }

  Future<void> _onPhotoScanned(
    FaceAnalysisPhotoScanned event,
    Emitter<FaceAnalysisState> emit,
  ) async {
    if (state.status == FaceAnalysisStatus.uploading) return;
    if (state.atPhotoLimit) {
      emit(state.copyWith(photoLimitReached: true));
      return;
    }
    emit(
      state.copyWith(
        status: FaceAnalysisStatus.uploading,
        clearUploadedPhotoUrl: true,
        clearFaceProfileId: true,
        clearError: true,
        awaitingAnalysis: true,
        analysisFailed: false,
        photoLimitReached: false,
      ),
    );
    try {
      final photo = await _faceProfile.uploadFacePhoto(event.filePath);
      if (emit.isDone) return;
      emit(
        state.copyWith(
          uploadedPhotoUrl: photo.imageUrl,
          faceProfileId: photo.id,
          photos: [...state.photos, photo],
        ),
      );
      await _pollAnalysis(photo.id, emit);
    } catch (error) {
      if (emit.isDone) return;
      final limitReached =
          error is ApiException && error.code == 'face_photo_limit_reached';
      emit(
        state.copyWith(
          status: FaceAnalysisStatus.failed,
          error: error,
          photoLimitReached: limitReached,
        ),
      );
    }
  }

  Future<void> _onPhotoDeleted(
    FaceAnalysisPhotoDeleted event,
    Emitter<FaceAnalysisState> emit,
  ) async {
    try {
      await _faceProfile.deletePhoto(event.photoId);
      if (emit.isDone) return;
      emit(
        state.copyWith(
          photos: state.photos
              .where((photo) => photo.id != event.photoId)
              .toList(),
          photoLimitReached: false,
        ),
      );
    } catch (error) {
      if (emit.isDone) return;
      emit(state.copyWith(status: FaceAnalysisStatus.failed, error: error));
    }
  }

  Future<void> _onPhotoSetPrimary(
    FaceAnalysisPhotoSetPrimary event,
    Emitter<FaceAnalysisState> emit,
  ) async {
    try {
      final updated = await _faceProfile.setPrimaryPhoto(event.photoId);
      if (emit.isDone) return;
      emit(
        state.copyWith(
          photos: [
            for (final photo in state.photos)
              photo.id == updated.id
                  ? updated
                  : FacePhotoDto(
                      id: photo.id,
                      imageUrl: photo.imageUrl,
                      isPrimary: false,
                      analysisStatus: photo.analysisStatus,
                      uploadedAt: photo.uploadedAt,
                    ),
          ],
        ),
      );
    } catch (error) {
      if (emit.isDone) return;
      emit(state.copyWith(status: FaceAnalysisStatus.failed, error: error));
    }
  }

  Future<void> _onCheckedAgain(
    FaceAnalysisCheckedAgain event,
    Emitter<FaceAnalysisState> emit,
  ) async {
    final status = state.status;
    if (status == FaceAnalysisStatus.initial ||
        status == FaceAnalysisStatus.loading ||
        status == FaceAnalysisStatus.uploading) {
      return;
    }
    final profileId = state.faceProfileId;
    if (profileId == null) {
      await _load(emit);
    } else {
      await _pollAnalysis(profileId, emit);
    }
  }

  Future<void> _pollAnalysis(
    String profileId,
    Emitter<FaceAnalysisState> emit,
  ) async {
    try {
      for (var attempt = 0; attempt <= _analysisPollDelays.length; attempt++) {
        if (attempt > 0) await _wait(_analysisPollDelays[attempt - 1]);
        final profile = await _faceProfile.getProfile(profileId);
        if (emit.isDone) return;
        switch (profile.analysisStatus) {
          case FaceProfileAnalysisStatus.completed:
            emit(state.copyWith(awaitingAnalysis: false));
            await _load(emit);
            return;
          case FaceProfileAnalysisStatus.failed:
            emit(
              state.copyWith(
                status: FaceAnalysisStatus.failed,
                awaitingAnalysis: false,
                analysisFailed: true,
                error: StateError('Face analysis failed.'),
              ),
            );
            return;
          case FaceProfileAnalysisStatus.pending:
          case null:
            emit(
              state.copyWith(
                status: FaceAnalysisStatus.ready,
                awaitingAnalysis: true,
              ),
            );
        }
      }
    } catch (error) {
      if (emit.isDone) return;
      emit(state.copyWith(status: FaceAnalysisStatus.failed, error: error));
    }
  }

  Future<void> _load(Emitter<FaceAnalysisState> emit) async {
    emit(state.copyWith(status: FaceAnalysisStatus.loading));
    try {
      final photos = await _loadPhotos();
      final recommendations = await _faceProfile.getRecommendations();
      if (emit.isDone) return;
      if (recommendations.isEmpty) {
        emit(
          state.copyWith(
            status: FaceAnalysisStatus.ready,
            clearLatest: true,
            clearCurated: true,
            photos: photos,
          ),
        );
        return;
      }
      final latest = recommendations.first;
      final curatedResult = await _resolveCurated(
        latest.recommendedCatalogItemIds,
      );
      if (emit.isDone) return;
      emit(
        state.copyWith(
          status: curatedResult.error == null
              ? FaceAnalysisStatus.ready
              : FaceAnalysisStatus.degraded,
          latest: latest,
          curated: curatedResult.items,
          awaitingAnalysis: false,
          analysisFailed: false,
          catalogError: curatedResult.error,
          clearCatalogError: curatedResult.error == null,
          photos: photos,
        ),
      );
    } catch (error) {
      if (emit.isDone) return;
      emit(state.copyWith(status: FaceAnalysisStatus.failed, error: error));
    }
  }

  Future<List<FacePhotoDto>> _loadPhotos() async {
    try {
      return await _faceProfile.listPhotos();
    } catch (_) {
      return state.photos;
    }
  }

  Future<_CuratedResult> _resolveCurated(List<String>? ids) async {
    if (ids == null || ids.isEmpty) return const _CuratedResult([]);
    final wanted = ids.toSet();
    final found = <CatalogItemDto>[];
    try {
      for (
        var page = 1;
        page <= _maxCatalogPages && found.length < wanted.length;
        page++
      ) {
        final result = await _catalog.getCatalogItems(page: page, perPage: 100);
        for (final item in result.data) {
          if (wanted.contains(item.id)) found.add(item);
        }
      }
    } catch (error) {
      return _CuratedResult(found, error: error);
    }
    return _CuratedResult(found);
  }
}

class _CuratedResult {
  const _CuratedResult(this.items, {this.error});

  final List<CatalogItemDto> items;
  final Object? error;
}
