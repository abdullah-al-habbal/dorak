import 'package:dio/dio.dart';

import 'package:core/core.dart';

abstract class FaceProfileRepository {
  Future<FacePhotoDto> uploadFacePhoto(
    String filePath, {
    bool isPrimary = false,
  });

  Future<List<FaceAnalysisResultDto>> getRecommendations();

  Future<FacePhotoDto> getProfile(String id);

  Future<List<FacePhotoDto>> listPhotos();

  Future<void> deletePhoto(String id);

  Future<FacePhotoDto> setPrimaryPhoto(String id);
}

class DioFaceProfileRepository implements FaceProfileRepository {
  const DioFaceProfileRepository(this._apiClient);

  final ApiClient _apiClient;

  @override
  Future<FacePhotoDto> uploadFacePhoto(
    String filePath, {
    bool isPrimary = false,
  }) async {
    final formData = FormData.fromMap({
      'photo': await MultipartFile.fromFile(filePath),
      'is_primary': isPrimary,
    });
    return _apiClient.post<FacePhotoDto>(
      ApiEndpoints.faceProfile.upload,
      data: formData,
      parser: (json) => FacePhotoDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<List<FaceAnalysisResultDto>> getRecommendations() {
    return _apiClient.get<List<FaceAnalysisResultDto>>(
      ApiEndpoints.faceProfile.recommendations,
      parser: (json) => (json as List<dynamic>)
          .map(
            (item) =>
                FaceAnalysisResultDto.fromJson(item as Map<String, dynamic>),
          )
          .toList(),
    );
  }

  @override
  Future<FacePhotoDto> getProfile(String id) {
    return _apiClient.get<FacePhotoDto>(
      ApiEndpoints.faceProfile.profile(id),
      parser: (json) => FacePhotoDto.fromJson(json as Map<String, dynamic>),
    );
  }

  @override
  Future<List<FacePhotoDto>> listPhotos() {
    return _apiClient.get<List<FacePhotoDto>>(
      ApiEndpoints.faceProfile.list,
      parser: (json) => (json as List<dynamic>)
          .map((item) => FacePhotoDto.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }

  @override
  Future<void> deletePhoto(String id) {
    return _apiClient.delete(ApiEndpoints.faceProfile.delete(id));
  }

  @override
  Future<FacePhotoDto> setPrimaryPhoto(String id) {
    return _apiClient.patch<FacePhotoDto>(
      ApiEndpoints.faceProfile.setPrimary(id),
      parser: (json) => FacePhotoDto.fromJson(json as Map<String, dynamic>),
    );
  }
}
