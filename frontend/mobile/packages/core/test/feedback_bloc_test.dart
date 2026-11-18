import 'package:bloc_test/bloc_test.dart';
import 'package:core/core.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

class _FakeRepository implements FeedbackRepository {
  _FakeRepository({this.error});

  final Object? error;
  final sent = <FeedbackReportRequestDto>[];

  @override
  Future<void> submit(FeedbackReportRequestDto report) async {
    sent.add(report);
    if (error != null) throw error!;
  }
}

class _FixedVersion implements AppInfoProvider {
  const _FixedVersion();

  @override
  Future<String> version() async => '1.4.2+17';
}

const _submit = FeedbackSubmitted(
  kind: FeedbackKind.bug,
  message: 'The confirm button does nothing',
  locale: 'ar',
  screen: 'profile/about',
);

FeedbackBloc _bloc(_FakeRepository repository) => FeedbackBloc(
  repository,
  FeedbackApp.stylist,
  appInfo: const _FixedVersion(),
  platformName: () => 'ios',
);

ApiException _api(int status) =>
    ApiException(statusCode: status, code: 'X', message: 'm');

void main() {
  test(
    'sends the app, platform, version, locale and screen with the message',
    () async {
      final repository = _FakeRepository();
      final bloc = _bloc(repository);

      bloc.add(_submit);
      await bloc.stream.firstWhere((state) => state.isSent);

      final json = repository.sent.single.toJson();
      expect(json['app'], 'stylist');
      expect(json['platform'], 'ios');
      expect(json['app_version'], '1.4.2+17');
      expect(json['locale'], 'ar');
      expect(json['screen'], 'profile/about');
      await bloc.close();
    },
  );

  blocTest<FeedbackBloc, FeedbackState>(
    'moves from sending to sent',
    build: () => _bloc(_FakeRepository()),
    act: (bloc) => bloc.add(_submit),
    expect: () => const [
      FeedbackState(status: FeedbackStatus.sending),
      FeedbackState(status: FeedbackStatus.sent),
    ],
  );

  for (final (error, failure) in [
    (_api(429), FeedbackFailure.rateLimited),
    (_api(422), FeedbackFailure.invalid),
    (_api(500), FeedbackFailure.unknown),
    (
      const NetworkException(
        type: DioExceptionType.connectionError,
        retryable: true,
        message: 'offline',
      ),
      FeedbackFailure.network,
    ),
  ]) {
    blocTest<FeedbackBloc, FeedbackState>(
      'maps ${error.runtimeType} to $failure',
      build: () => _bloc(_FakeRepository(error: error)),
      act: (bloc) => bloc.add(_submit),
      expect: () => [
        const FeedbackState(status: FeedbackStatus.sending),
        FeedbackState(status: FeedbackStatus.failed, failure: failure),
      ],
    );
  }

  blocTest<FeedbackBloc, FeedbackState>(
    'a second submit while sending is ignored, and reset clears a failure',
    build: () => _bloc(_FakeRepository(error: _api(429))),
    act: (bloc) async {
      bloc
        ..add(_submit)
        ..add(_submit);
      await Future<void>.delayed(const Duration(milliseconds: 50));
      bloc.add(const FeedbackReset());
    },
    expect: () => [
      const FeedbackState(status: FeedbackStatus.sending),
      const FeedbackState(
        status: FeedbackStatus.failed,
        failure: FeedbackFailure.rateLimited,
      ),
      const FeedbackState(),
    ],
  );
}
