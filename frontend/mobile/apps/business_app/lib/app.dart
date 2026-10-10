import 'dart:async';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/barbers/manual_barber.bloc.dart';
import 'package:business_app/src/features/operations/branch_operations.bloc.dart';
import 'package:business_app/src/features/operations/branch_operations.screen.dart';

class DorakBusinessApp extends StatefulWidget {
  const DorakBusinessApp({super.key, this.tokenStorage, this.repository});

  final TokenStorage? tokenStorage;
  final ManagedBarberRepository? repository;

  @override
  State<DorakBusinessApp> createState() => _DorakBusinessAppState();
}

class _DorakBusinessAppState extends State<DorakBusinessApp> {
  late final TokenStorage _tokenStorage;
  late final ApiClient _apiClient;
  late final ManualBarberBloc _barbers;
  late final BranchOperationsBloc _operations;
  late final PushNotificationService _pushNotifications;

  @override
  void initState() {
    super.initState();
    _tokenStorage = widget.tokenStorage ?? SecureBranchTokenStorage();
    _apiClient = ApiClient(
      baseUrl: ConfigProvider.config.apiBaseV1Url,
      tokenProvider: _tokenStorage.read,
    );
    _pushNotifications = PushNotificationService(_apiClient);
    unawaited(_pushNotifications.initialize());
    _barbers = ManualBarberBloc(
      widget.repository ?? DioManagedBarberRepository(_apiClient),
    );
    _operations = BranchOperationsBloc(
      DioBranchOperationsRepository(_apiClient),
    );
  }

  @override
  void dispose() {
    _barbers.close();
    _operations.close();
    unawaited(_pushNotifications.dispose());
    _apiClient.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      locale: const Locale('en'),
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      theme: DorakTheme.forLocale(const Locale('en'), Brightness.light),
      home: BranchOperationsScreen(bloc: _operations),
    );
  }
}
