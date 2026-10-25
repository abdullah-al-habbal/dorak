import 'package:bloc_test/bloc_test.dart';
import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_app/src/features/profile/face_analysis.bloc.dart';
import 'package:client_app/src/features/profile/face_analysis.event.dart';
import 'package:client_app/src/features/profile/face_analysis.state.dart';

import 'helpers/fakes.dart';

void main() {
  late FakeFaceProfileRepository face;
  late FakeServiceCatalogRepository catalog;

  setUp(() {
    face = FakeFaceProfileRepository();
    catalog = FakeServiceCatalogRepository();
  });

  FaceAnalysisBloc bloc() {
    return FaceAnalysisBloc(face, catalog, wait: (_) async {});
  }

  group('FaceAnalysisStarted', () {
    blocTest<FaceAnalysisBloc, FaceAnalysisState>(
      'empty recommendations settle into the ready empty state',
      build: bloc,
      act: (bloc) => bloc.add(const FaceAnalysisStarted()),
      verify: (bloc) {
        expect(bloc.state.status, FaceAnalysisStatus.ready);
        expect(bloc.state.latest, isNull);
        expect(bloc.state.curated, isEmpty);
        expect(bloc.state.awaitingAnalysis, isFalse);
      },
    );

    blocTest<FaceAnalysisBloc, FaceAnalysisState>(
      'resolves curated catalog items for the latest recommendation',
      build: bloc,
      seed: () => FaceAnalysisState(status: FaceAnalysisStatus.initial),
      setUp: () {
        face.recommendations = [
          testFaceAnalysis(recommendedIds: ['catalog-1', 'catalog-2']),
        ];
        catalog.page = testCatalogPage(
          items: [
            testCatalogItem(id: 'catalog-1', name: 'Classic Fade'),
            testCatalogItem(id: 'catalog-2', name: 'Taper Cut'),
          ],
        );
      },
      act: (bloc) => bloc.add(const FaceAnalysisStarted()),
      verify: (bloc) {
        expect(bloc.state.status, FaceAnalysisStatus.ready);
        expect(bloc.state.latest?.id, 'analysis-1');
        expect(bloc.state.curated.map((item) => item.id), [
          'catalog-1',
          'catalog-2',
        ]);
        expect(face.recommendationsCalls, 1);
      },
    );

    blocTest<FaceAnalysisBloc, FaceAnalysisState>(
      'a failed recommendations fetch fails the card',
      build: bloc,
      setUp: () => face.recommendationsError = offline(),
      act: (bloc) => bloc.add(const FaceAnalysisStarted()),
      verify: (bloc) {
        expect(bloc.state.status, FaceAnalysisStatus.failed);
        expect(bloc.state.error, isA<NetworkException>());
      },
    );

    blocTest<FaceAnalysisBloc, FaceAnalysisState>(
      'a catalog failure produces an explicit degraded result',
      build: bloc,
      setUp: () {
        face.recommendations = [testFaceAnalysis()];
        catalog.page = testCatalogPage(items: const []);
        catalog.error = offline();
      },
      act: (bloc) => bloc.add(const FaceAnalysisStarted()),
      verify: (bloc) {
        expect(bloc.state.status, FaceAnalysisStatus.degraded);
        expect(bloc.state.latest, isNotNull);
        expect(bloc.state.curated, isEmpty);
        expect(bloc.state.catalogError, isA<NetworkException>());
      },
    );
  });

  group('FaceAnalysisPhotoScanned', () {
    blocTest<FaceAnalysisBloc, FaceAnalysisState>(
      'upload polls pending then completed and loads recommendations',
      build: bloc,
      setUp: () {
        face.profileStatuses = [
          FaceProfileAnalysisStatus.pending,
          FaceProfileAnalysisStatus.completed,
        ];
        face.recommendations = [testFaceAnalysis()];
      },
      act: (bloc) => bloc.add(const FaceAnalysisPhotoScanned('/tmp/face.jpg')),
      verify: (bloc) {
        expect(face.uploadCalls, 1);
        expect(face.profileCalls, 2);
        expect(bloc.state.faceProfileId, 'photo-1');
        expect(bloc.state.awaitingAnalysis, isFalse);
        expect(bloc.state.latest?.detectedFaceShape, 'oval');
      },
    );

    blocTest<FaceAnalysisBloc, FaceAnalysisState>(
      'terminal analysis failure is retryable as a new scan',
      build: bloc,
      setUp: () => face.profileStatuses = [FaceProfileAnalysisStatus.failed],
      act: (bloc) => bloc.add(const FaceAnalysisPhotoScanned('/tmp/face.jpg')),
      verify: (bloc) {
        expect(bloc.state.status, FaceAnalysisStatus.failed);
        expect(bloc.state.analysisFailed, isTrue);
        expect(bloc.state.awaitingAnalysis, isFalse);
      },
    );

    blocTest<FaceAnalysisBloc, FaceAnalysisState>(
      'an upload followed by no result leaves the card awaiting analysis',
      build: bloc,
      act: (bloc) => bloc.add(const FaceAnalysisPhotoScanned('/tmp/face.jpg')),
      verify: (bloc) {
        expect(face.uploadCalls, 1);
        expect(face.lastUploadedPath, '/tmp/face.jpg');
        expect(face.lastIsPrimary, isFalse);
        expect(bloc.state.status, FaceAnalysisStatus.ready);
        expect(bloc.state.uploadedPhotoUrl, isNotNull);
        expect(bloc.state.latest, isNull);
        expect(bloc.state.awaitingAnalysis, isTrue);
      },
    );

    blocTest<FaceAnalysisBloc, FaceAnalysisState>(
      'an upload failure fails the card and keeps the pending flag',
      build: bloc,
      setUp: () => face.uploadError = offline(),
      act: (bloc) => bloc.add(const FaceAnalysisPhotoScanned('/tmp/face.jpg')),
      verify: (bloc) {
        expect(bloc.state.status, FaceAnalysisStatus.failed);
        expect(bloc.state.error, isA<NetworkException>());
        expect(bloc.state.awaitingAnalysis, isTrue);
      },
    );
  });

  group('FaceAnalysisCheckedAgain', () {
    blocTest<FaceAnalysisBloc, FaceAnalysisState>(
      'checking again after the job completes loads the result',
      build: bloc,
      seed: () => FaceAnalysisState(
        status: FaceAnalysisStatus.ready,
        awaitingAnalysis: true,
        uploadedPhotoUrl: 'https://cdn.example.com/face.jpg',
      ),
      setUp: () {
        face.recommendations = [testFaceAnalysis()];
      },
      act: (bloc) => bloc.add(const FaceAnalysisCheckedAgain()),
      verify: (bloc) {
        expect(bloc.state.status, FaceAnalysisStatus.ready);
        expect(bloc.state.latest?.detectedFaceShape, 'oval');
        expect(bloc.state.awaitingAnalysis, isFalse);
        expect(bloc.state.curated.map((item) => item.id), ['catalog-1']);
      },
    );

    blocTest<FaceAnalysisBloc, FaceAnalysisState>(
      'checking again while still empty stays pending',
      build: bloc,
      seed: () => FaceAnalysisState(
        status: FaceAnalysisStatus.ready,
        awaitingAnalysis: true,
      ),
      act: (bloc) => bloc.add(const FaceAnalysisCheckedAgain()),
      verify: (bloc) {
        expect(bloc.state.status, FaceAnalysisStatus.ready);
        expect(bloc.state.latest, isNull);
        expect(bloc.state.awaitingAnalysis, isTrue);
      },
    );

    blocTest<FaceAnalysisBloc, FaceAnalysisState>(
      'retrying after a failed load reloads the recommendations',
      build: bloc,
      seed: () => FaceAnalysisState(status: FaceAnalysisStatus.ready),
      setUp: () => face.recommendationsError = offline(),
      act: (bloc) => bloc.add(const FaceAnalysisCheckedAgain()),
      verify: (bloc) {
        expect(bloc.state.status, FaceAnalysisStatus.failed);
      },
    );
  });

  group('photo gallery', () {
    blocTest<FaceAnalysisBloc, FaceAnalysisState>(
      'loads the photo gallery alongside recommendations',
      build: bloc,
      setUp: () {
        face.photos = [testFacePhoto(id: 'photo-1')];
      },
      act: (bloc) => bloc.add(const FaceAnalysisStarted()),
      verify: (bloc) {
        expect(bloc.state.photos.map((p) => p.id), ['photo-1']);
        expect(bloc.state.atPhotoLimit, isFalse);
      },
    );

    blocTest<FaceAnalysisBloc, FaceAnalysisState>(
      'rejects a scan client-side once 5 photos are already loaded',
      build: bloc,
      setUp: () {
        face.photos = List.generate(5, (i) => testFacePhoto(id: 'photo-$i'));
      },
      act: (bloc) async {
        bloc.add(const FaceAnalysisStarted());
        await Future<void>.delayed(Duration.zero);
        bloc.add(const FaceAnalysisPhotoScanned('/tmp/face.jpg'));
      },
      verify: (bloc) {
        expect(bloc.state.photoLimitReached, isTrue);
        expect(face.uploadCalls, 0);
      },
    );

    blocTest<FaceAnalysisBloc, FaceAnalysisState>(
      'maps the server face_photo_limit_reached error onto the state',
      build: bloc,
      setUp: () {
        face.uploadError = const ApiException(
          statusCode: 422,
          code: 'face_photo_limit_reached',
          message: 'A client may have at most 5 face profile photos.',
        );
      },
      act: (bloc) => bloc.add(const FaceAnalysisPhotoScanned('/tmp/face.jpg')),
      verify: (bloc) {
        expect(bloc.state.status, FaceAnalysisStatus.failed);
        expect(bloc.state.photoLimitReached, isTrue);
      },
    );

    blocTest<FaceAnalysisBloc, FaceAnalysisState>(
      'deletes a photo from the gallery',
      build: bloc,
      seed: () => FaceAnalysisState(
        status: FaceAnalysisStatus.ready,
        photos: [testFacePhoto(id: 'photo-1'), testFacePhoto(id: 'photo-2')],
      ),
      act: (bloc) => bloc.add(const FaceAnalysisPhotoDeleted('photo-1')),
      verify: (bloc) {
        expect(face.lastDeletedPhotoId, 'photo-1');
        expect(bloc.state.photos.map((p) => p.id), ['photo-2']);
      },
    );

    blocTest<FaceAnalysisBloc, FaceAnalysisState>(
      'sets a photo as primary and unsets the others locally',
      build: bloc,
      seed: () => FaceAnalysisState(
        status: FaceAnalysisStatus.ready,
        photos: [testFacePhoto(id: 'photo-1'), testFacePhoto(id: 'photo-2')],
      ),
      act: (bloc) => bloc.add(const FaceAnalysisPhotoSetPrimary('photo-2')),
      verify: (bloc) {
        expect(face.lastSetPrimaryPhotoId, 'photo-2');
        final primary = bloc.state.photos.firstWhere((p) => p.id == 'photo-2');
        final other = bloc.state.photos.firstWhere((p) => p.id == 'photo-1');
        expect(primary.isPrimary, isTrue);
        expect(other.isPrimary, isFalse);
      },
    );
  });
}
