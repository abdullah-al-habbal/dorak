import 'package:equatable/equatable.dart';

sealed class FaceAnalysisEvent extends Equatable {
  const FaceAnalysisEvent();

  @override
  List<Object?> get props => [];
}

class FaceAnalysisStarted extends FaceAnalysisEvent {
  const FaceAnalysisStarted();
}

class FaceAnalysisPhotoScanned extends FaceAnalysisEvent {
  const FaceAnalysisPhotoScanned(this.filePath);

  final String filePath;

  @override
  List<Object?> get props => [filePath];
}

class FaceAnalysisCheckedAgain extends FaceAnalysisEvent {
  const FaceAnalysisCheckedAgain();
}

class FaceAnalysisPhotoDeleted extends FaceAnalysisEvent {
  const FaceAnalysisPhotoDeleted(this.photoId);

  final String photoId;

  @override
  List<Object?> get props => [photoId];
}

class FaceAnalysisPhotoSetPrimary extends FaceAnalysisEvent {
  const FaceAnalysisPhotoSetPrimary(this.photoId);

  final String photoId;

  @override
  List<Object?> get props => [photoId];
}
