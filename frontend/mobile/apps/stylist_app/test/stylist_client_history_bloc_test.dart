import 'package:core/core.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:stylist_app/src/features/history/stylist_client_history.bloc.dart';

import 'helpers/stylist_fakes.dart';

void main() {
  late FakeBarberHistoryRepository history;
  late FakePhotoPicker picker;
  late StylistClientHistoryBloc bloc;

  setUp(() async {
    history = FakeBarberHistoryRepository();
    picker = FakePhotoPicker();
    bloc = StylistClientHistoryBloc(history, picker, () => 'barber-1');
    await bloc.load('client-1');
  });

  tearDown(() => bloc.close());

  test('load reads the client visits', () {
    expect(history.requestedClientId, 'client-1');
    expect(bloc.state.visits.map((visit) => visit.id), ['h1', 'h2']);
  });

  test('only visits the stylist performed accept media', () {
    expect(bloc.canAttachTo(bloc.state.visits[0]), isTrue);
    expect(bloc.canAttachTo(bloc.state.visits[1]), isFalse);
  });

  test('attachPhoto uploads the picked photo with its tag', () async {
    final uploaded = await bloc.attachPhoto('h1', 'before');

    expect(uploaded, isTrue);
    expect(history.attachedHistoryId, 'h1');
    expect(history.attachedPath, '/tmp/photo.jpg');
    expect(history.attachedType, 'before');
    expect(bloc.state.visits.first.media.single.photoType, 'before');
    expect(bloc.state.uploadingId, isNull);
  });

  test('cancelling the picker uploads nothing', () async {
    picker.path = null;

    expect(await bloc.attachPhoto('h1', 'after'), isFalse);
    expect(history.attachedHistoryId, isNull);
    expect(bloc.state.error, isNull);
  });

  test('a rejected upload surfaces the error and keeps the visit', () async {
    history.attachError = ApiException(
      statusCode: 403,
      code: 'FORBIDDEN',
      message: 'forbidden',
    );

    expect(await bloc.attachPhoto('h1', 'after'), isFalse);
    expect(bloc.state.error, isA<ApiException>());
    expect(bloc.state.uploadingId, isNull);
    expect(bloc.state.visits.first.media, isEmpty);
  });

  test('switching client clears the previous visits', () async {
    history.visits = [];
    await bloc.load('client-2');

    expect(history.requestedClientId, 'client-2');
    expect(bloc.state.visits, isEmpty);
  });
}
