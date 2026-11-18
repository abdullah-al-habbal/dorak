import 'package:business_app/src/features/owner/owner_billing.bloc.dart';
import 'package:business_app/src/features/owner/owner_branches.bloc.dart';
import 'package:business_app/src/features/owner/owner_home.bloc.dart';
import 'package:business_app/src/features/owner/owner_services.bloc.dart';

/// The cubits of the brand owner shell, built once like `BusinessFeatureBlocs`.
class OwnerFeatureBlocs {
  const OwnerFeatureBlocs({
    required this.home,
    required this.branches,
    required this.billing,
    required this.services,
  });

  final OwnerHomeCubit home;
  final OwnerBranchesCubit branches;
  final OwnerBillingCubit billing;
  final OwnerServicesCubit services;

  Future<void> close() => Future.wait([
    home.close(),
    branches.close(),
    billing.close(),
    services.close(),
  ]);
}
