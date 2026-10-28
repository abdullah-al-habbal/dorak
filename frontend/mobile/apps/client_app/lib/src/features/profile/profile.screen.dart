import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';

import 'package:client_app/src/features/profile/avatar.bloc.dart';
import 'package:client_app/src/features/profile/avatar.event.dart';
import 'package:client_app/src/features/profile/face_analysis.bloc.dart';
import 'package:client_app/src/features/profile/face_analysis.event.dart';
import 'package:client_app/src/features/profile/face_analysis.state.dart';
import 'package:client_app/src/features/profile/history.bloc.dart';
import 'package:client_app/src/features/profile/history.event.dart';
import 'package:client_app/src/features/profile/history_media_type.entity.dart';
import 'package:client_app/src/features/profile/history.state.dart';
import 'package:client_app/src/features/profile/photo_picker.provider.dart';
import 'package:client_app/src/features/profile/widgets/curated_card.widget.dart';
import 'package:client_app/src/features/profile/widgets/face_card.widget.dart';
import 'package:client_app/src/features/profile/widgets/history_feed.widget.dart';
import 'package:client_app/src/features/profile/widgets/profile_header.widget.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({
    super.key,
    required this.history,
    required this.faceAnalysis,
    required this.avatar,
    required this.photoPicker,
    required this.clientName,
    required this.onChangePassword,
    required this.onViewBookings,
    required this.onEditProfile,
    required this.onSavedAddresses,
    required this.onNotifications,
    required this.onSettings,
    required this.onDeleteAccount,
    required this.onDiscoveryPreferences,
  });

  final HistoryBloc history;
  final FaceAnalysisBloc faceAnalysis;
  final AvatarBloc avatar;
  final PhotoPicker photoPicker;
  final String? clientName;
  final VoidCallback onChangePassword;
  final VoidCallback onViewBookings;
  final VoidCallback onEditProfile;
  final VoidCallback onSavedAddresses;
  final VoidCallback onNotifications;
  final VoidCallback onSettings;
  final VoidCallback onDeleteAccount;
  final VoidCallback onDiscoveryPreferences;

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  StreamSubscription<HistoryState>? _refreshSubscription;

  Future<void> _refresh() async {
    await _refreshSubscription?.cancel();
    final completion = Completer<void>();
    var started = false;
    late final StreamSubscription<HistoryState> subscription;
    _refreshSubscription = subscription = widget.history.stream.listen((state) {
      if (state.page.isRefreshing) {
        started = true;
      } else if (started && !completion.isCompleted) {
        completion.complete();
        unawaited(subscription.cancel());
        _refreshSubscription = null;
      }
    });
    widget.history.add(const HistoryRefreshRequested());
    await completion.future;
  }

  Future<void> _attachPhoto(ServiceHistoryDto item) async {
    final path = await widget.photoPicker.pickPhoto();
    if (path == null || !mounted) return;
    widget.history.add(
      HistoryMediaAttachRequested(
        id: item.id,
        photoPath: path,
        photoType: HistoryMediaType.after,
      ),
    );
  }

  @override
  void dispose() {
    unawaited(_refreshSubscription?.cancel());
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    widget.history.add(const HistoryStarted());
    widget.faceAnalysis.add(const FaceAnalysisStarted());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocBuilder<HistoryBloc, HistoryState>(
          bloc: widget.history,
          builder: (context, state) {
            if (state.rebooked) return _successView(context);
            return NotificationListener<ScrollNotification>(
              onNotification: (notification) {
                if (notification is ScrollUpdateNotification &&
                    notification.metrics.pixels >=
                        notification.metrics.maxScrollExtent - 200) {
                  widget.history.add(const HistoryLoadMoreRequested());
                }
                return false;
              },
              child: RefreshIndicator(
                onRefresh: _refresh,
                child: ListView(
                  padding: const EdgeInsets.all(DorakDimensions.marginMobile),
                  children: [
                    ProfileHeader(
                      avatar: widget.avatar,
                      clientName: widget.clientName,
                      onPickAvatar: () => _pickAndUploadAvatar(context),
                    ),
                    SecondaryButton(
                      label: AppLocalizations.of(context)!.profileEditAction,
                      onPressed: widget.onEditProfile,
                    ),
                    const SizedBox(height: DorakDimensions.spacingSmall),
                    SecondaryButton(
                      label: AppLocalizations.of(
                        context,
                      )!.profileSavedAddressesAction,
                      onPressed: widget.onSavedAddresses,
                    ),
                    const SizedBox(height: DorakDimensions.spacingSmall),
                    SecondaryButton(
                      label: AppLocalizations.of(
                        context,
                      )!.profileNotificationsAction,
                      onPressed: widget.onNotifications,
                    ),
                    const SizedBox(height: DorakDimensions.spacingSmall),
                    SecondaryButton(
                      label: AppLocalizations.of(
                        context,
                      )!.profileSettingsAction,
                      onPressed: widget.onSettings,
                    ),
                    const SizedBox(height: DorakDimensions.spacingLarge),
                    SecondaryButton(
                      label: AppLocalizations.of(context)!.changePasswordTitle,
                      onPressed: widget.onChangePassword,
                    ),
                    ..._faceAnalysisSection(context),
                    ..._curatedSection(context),
                    const SizedBox(height: DorakDimensions.spacingLarge),
                    Text(
                      AppLocalizations.of(context)!.historyTitle,
                      style: DorakTypography.titleLg,
                    ),
                    const SizedBox(height: DorakDimensions.spacingSmall),
                    HistoryFeed(
                      state: state,
                      localeCode: Localizations.localeOf(context).languageCode,
                      onRetry: () =>
                          widget.history.add(const HistoryRetryRequested()),
                      onRebook: (item) => _pickRebookTime(context, item),
                      onAttachPhoto: _attachPhoto,
                    ),
                    const SizedBox(height: DorakDimensions.spacingLarge),
                    SecondaryButton(
                      label: AppLocalizations.of(
                        context,
                      )!.discoveryPreferencesTitle,
                      onPressed: widget.onDiscoveryPreferences,
                    ),
                    const SizedBox(height: DorakDimensions.spacingSmall),
                    SecondaryButton(
                      label: AppLocalizations.of(context)!.deleteAccountTitle,
                      onPressed: widget.onDeleteAccount,
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _successView(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return StatusView(
      icon: Icons.check_circle_outline,
      title: l10n.historyRebookSuccessTitle,
      message: l10n.historyRebookSuccessMessage,
      actionLabel: l10n.bookingViewBookings,
      onAction: () {
        widget.history.add(const HistoryRebookAcknowledged());
        widget.onViewBookings();
      },
    );
  }

  Future<void> _pickAndUploadAvatar(BuildContext context) async {
    final path = await widget.photoPicker.pickPhoto();
    if (path == null) return;
    widget.avatar.add(AvatarPhotoChanged(path));
  }

  List<Widget> _faceAnalysisSection(BuildContext context) {
    return [
      BlocBuilder<FaceAnalysisBloc, FaceAnalysisState>(
        bloc: widget.faceAnalysis,
        builder: (context, state) => FaceCard(
          state: state,
          onScan: () => _pickAndScanFace(context),
          onCheckAgain: () =>
              widget.faceAnalysis.add(const FaceAnalysisCheckedAgain()),
        ),
      ),
      const SizedBox(height: DorakDimensions.spacingLarge),
    ];
  }

  List<Widget> _curatedSection(BuildContext context) {
    return [
      BlocBuilder<FaceAnalysisBloc, FaceAnalysisState>(
        bloc: widget.faceAnalysis,
        builder: (context, state) {
          final l10n = AppLocalizations.of(context)!;
          final colors = DorakColors.of(context);
          if (state.status != FaceAnalysisStatus.ready &&
              state.status != FaceAnalysisStatus.degraded) {
            return const SizedBox.shrink();
          }
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(l10n.curatedForYouTitle, style: DorakTypography.titleLg),
              const SizedBox(height: DorakDimensions.spacingSmall),
              if (state.curated.isEmpty)
                Text(
                  l10n.curatedEmptyMessage,
                  style: DorakTypography.bodyMd.copyWith(
                    color: colors.onSurfaceVariant,
                  ),
                )
              else
                ...state.curated.map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(
                      bottom: DorakDimensions.spacingMedium,
                    ),
                    child: CuratedCard(item: item),
                  ),
                ),
            ],
          );
        },
      ),
      const SizedBox(height: DorakDimensions.spacingLarge),
    ];
  }

  Future<void> _pickAndScanFace(BuildContext context) async {
    final path = await widget.photoPicker.pickPhoto();
    if (path == null) return;
    widget.faceAnalysis.add(FaceAnalysisPhotoScanned(path));
  }

  Future<void> _pickRebookTime(
    BuildContext context,
    ServiceHistoryDto item,
  ) async {
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      firstDate: now,
      lastDate: now.add(const Duration(days: 60)),
    );
    if (date == null || !context.mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );
    if (time == null) return;
    widget.history.add(
      HistoryRebookRequested(
        item.id,
        DateTime(date.year, date.month, date.day, time.hour, time.minute),
      ),
    );
  }
}
