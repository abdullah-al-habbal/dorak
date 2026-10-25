import 'dart:io';

import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers/fake_dio.dart';

Map<String, dynamic> analysis({
  String id = 'analysis-1',
  String faceProfileId = 'face-2',
  String shape = 'oval',
  double confidence = 0.87,
  bool withIds = true,
}) => {
  'id': id,
  'face_profile_id': faceProfileId,
  'analysis_version': '1.0.0',
  'analysis_source': 'third_party_api',
  'detected_face_shape': shape,
  'confidence_score': confidence,
  'detected_features': {
    'forehead_width': 4,
    'jaw_angle': 3,
    'cheekbone_prominence': 'medium',
  },
  'recommended_catalog_item_ids': withIds ? ['catalog-1', 'catalog-2'] : null,
  'computed_at': '2026-09-10T10:00:00.000Z',
  'face_profile': {
    'id': faceProfileId,
    'image_url': 'https://cdn.dorak.io/face-profiles/face-2.jpg',
  },
  'created_at': '2026-09-10T10:05:00.000Z',
};

void main() {
  group('DioFaceProfileRepository', () {
    test('uploadFacePhoto posts multipart form data', () async {
      late RequestOptions captured;
      final file = File('${Directory.systemTemp.path}/face.jpg')
        ..writeAsStringSync('photo bytes');
      addTearDown(file.deleteSync);
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            statusCode: 201,
            data: successEnvelope(
              statusCode: 201,
              code: 'CREATED',
              data: {
                'id': 'face-1',
                'image_url': 'https://cdn.dorak.io/face-profiles/face-1.jpg',
                'is_primary': false,
                'uploaded_at': '2026-09-10T09:00:00.000Z',
              },
            ),
          );
        },
      );
      final repository = DioFaceProfileRepository(clientWith(fake));

      final photo = await repository.uploadFacePhoto(file.path);

      expect(captured.path, FaceProfileEndpoints.upload);
      expect(captured.method, 'POST');
      final formData = captured.data as FormData;
      expect(formData.files.single.key, 'photo');
      expect(formData.files.single.value.filename, 'face.jpg');
      expect(formData.fields.single.key, 'is_primary');
      expect(formData.fields.single.value, 'false');
      expect(photo.id, 'face-1');
      expect(photo.imageUrl, 'https://cdn.dorak.io/face-profiles/face-1.jpg');
      expect(photo.isPrimary, isFalse);
    });

    test('uploadFacePhoto requires a primary flag when asked', () async {
      late RequestOptions captured;
      final file = File('${Directory.systemTemp.path}/face.jpg')
        ..writeAsStringSync('photo bytes');
      addTearDown(file.deleteSync);
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            statusCode: 201,
            data: successEnvelope(
              statusCode: 201,
              code: 'CREATED',
              data: {
                'id': 'face-2',
                'image_url': 'https://cdn.dorak.io/face-profiles/face-2.jpg',
                'is_primary': true,
                'uploaded_at': '2026-09-10T09:01:00.000Z',
              },
            ),
          );
        },
      );
      final repository = DioFaceProfileRepository(clientWith(fake));

      await repository.uploadFacePhoto(file.path, isPrimary: true);

      final formData = captured.data as FormData;
      expect(formData.fields.single.value, 'true');
    });

    test(
      'getRecommendations parses the analysis list, latest order kept',
      () async {
        late RequestOptions captured;
        final fake = fakeDio(
          handler: (options) {
            captured = options;
            return jsonResponse(
              options,
              data: successEnvelope(
                data: [
                  analysis(shape: 'square', confidence: 0.91),
                  analysis(shape: 'round', confidence: 0.62, withIds: false),
                ],
              ),
            );
          },
        );
        final repository = DioFaceProfileRepository(clientWith(fake));

        final results = await repository.getRecommendations();

        expect(captured.path, FaceProfileEndpoints.recommendations);
        expect(captured.method, 'GET');
        expect(results, hasLength(2));
        expect(results.first.detectedFaceShape, 'square');
        expect(results.first.confidenceScore, 0.91);
        expect(results.first.recommendedCatalogItemIds, [
          'catalog-1',
          'catalog-2',
        ]);
        expect(
          results.first.faceProfile?.imageUrl,
          'https://cdn.dorak.io/face-profiles/face-2.jpg',
        );
        expect(results.last.recommendedCatalogItemIds, isNull);
        expect(results.last.faceProfile, isNotNull);
      },
    );

    test('getProfile reads the profile analysis status', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            data: successEnvelope(
              data: {
                'id': 'face-3',
                'image_url': 'https://cdn.dorak.io/face-profiles/face-3.jpg',
                'is_primary': true,
                'analysis_status': 'pending',
                'uploaded_at': '2026-09-10T09:02:00.000Z',
                'created_at': '2026-09-10T09:02:00.000Z',
              },
            ),
          );
        },
      );
      final repository = DioFaceProfileRepository(clientWith(fake));

      final profile = await repository.getProfile('face-3');

      expect(captured.path, FaceProfileEndpoints.profile('face-3'));
      expect(captured.method, 'GET');
      expect(profile.analysisStatus, FaceProfileAnalysisStatus.pending);
    });

    test('listPhotos parses the owning clients photo list', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            data: successEnvelope(
              data: [
                {
                  'id': 'face-1',
                  'image_url': 'https://cdn.dorak.io/face-profiles/face-1.jpg',
                  'is_primary': true,
                  'uploaded_at': '2026-09-10T09:00:00.000Z',
                },
              ],
            ),
          );
        },
      );
      final repository = DioFaceProfileRepository(clientWith(fake));

      final photos = await repository.listPhotos();

      expect(captured.path, FaceProfileEndpoints.list);
      expect(captured.method, 'GET');
      expect(photos, hasLength(1));
      expect(photos.first.isPrimary, isTrue);
    });

    test('deletePhoto sends a DELETE request', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(options, data: successEnvelope(data: null));
        },
      );
      final repository = DioFaceProfileRepository(clientWith(fake));

      await repository.deletePhoto('face-1');

      expect(captured.path, FaceProfileEndpoints.delete('face-1'));
      expect(captured.method, 'DELETE');
    });

    test('setPrimaryPhoto patches the primary flag', () async {
      late RequestOptions captured;
      final fake = fakeDio(
        handler: (options) {
          captured = options;
          return jsonResponse(
            options,
            data: successEnvelope(
              data: {
                'id': 'face-1',
                'image_url': 'https://cdn.dorak.io/face-profiles/face-1.jpg',
                'is_primary': true,
                'uploaded_at': '2026-09-10T09:00:00.000Z',
              },
            ),
          );
        },
      );
      final repository = DioFaceProfileRepository(clientWith(fake));

      final photo = await repository.setPrimaryPhoto('face-1');

      expect(captured.path, FaceProfileEndpoints.setPrimary('face-1'));
      expect(captured.method, 'PATCH');
      expect(photo.isPrimary, isTrue);
    });

    test(
      'uploadFacePhoto surfaces the photo limit error as ApiException',
      () async {
        final file = File('${Directory.systemTemp.path}/face-limit.jpg')
          ..writeAsStringSync('photo bytes');
        addTearDown(file.deleteSync);
        final fake = fakeDio(
          handler: (options) => jsonResponse(
            options,
            statusCode: 422,
            data: errorEnvelope(
              statusCode: 422,
              code: 'face_photo_limit_reached',
              message: 'A client may have at most 5 face profile photos.',
            ),
          ),
        );
        final repository = DioFaceProfileRepository(clientWith(fake));

        final limitReached = isA<ApiException>().having(
          (error) => error.code,
          'code',
          'face_photo_limit_reached',
        );

        await expectLater(
          repository.uploadFacePhoto(file.path),
          throwsA(limitReached),
        );
      },
    );
  });
}
