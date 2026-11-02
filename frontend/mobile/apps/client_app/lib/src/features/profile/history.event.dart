import 'package:equatable/equatable.dart';

sealed class HistoryEvent extends Equatable {
  const HistoryEvent();

  @override
  List<Object?> get props => [];
}

class HistoryStarted extends HistoryEvent {
  const HistoryStarted();
}

class HistoryRefreshRequested extends HistoryEvent {
  const HistoryRefreshRequested();
}

class HistoryLoadMoreRequested extends HistoryEvent {
  const HistoryLoadMoreRequested();
}

class HistoryRetryRequested extends HistoryEvent {
  const HistoryRetryRequested();
}

class HistoryRebookRequested extends HistoryEvent {
  const HistoryRebookRequested(this.id, this.startsAt);

  final String id;
  final DateTime startsAt;

  @override
  List<Object?> get props => [id, startsAt];
}

class HistoryRebookAcknowledged extends HistoryEvent {
  const HistoryRebookAcknowledged();
}

class HistoryMediaAttachRequested extends HistoryEvent {
  const HistoryMediaAttachRequested({
    required this.id,
    required this.photoPath,
    required this.photoType,
  });

  final String id;
  final String photoPath;
  final String photoType;

  @override
  List<Object?> get props => [id, photoPath, photoType];
}
