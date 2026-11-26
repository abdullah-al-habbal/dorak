import 'dart:async';

import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/owner/owner_home.state.dart';

/// Decides what the owner sees first: the brand with its approval banner, a pointer to
/// the web registration for an account with no brand, or an error.
class OwnerHomeCubit extends Cubit<OwnerHomeState> {
  OwnerHomeCubit(this._owner) : super(const OwnerHomeState());

  final OwnerRepository _owner;
  int _loadGeneration = 0;
  bool _isRefreshingBrand = false;

  Future<void> load() async {
    final generation = ++_loadGeneration;
    emit(const OwnerHomeState());
    try {
      final access = await _owner.resolveAccess();
      if (access is! OwnerAccessGranted) {
        if (!_isStale(generation)) {
          emit(const OwnerHomeState(status: OwnerHomeStatus.noBrand));
        }
        return;
      }
      final brands = await _owner.getBrands();
      if (_isStale(generation)) return;
      emit(
        brands.isEmpty
            ? const OwnerHomeState(status: OwnerHomeStatus.noBrand)
            : OwnerHomeState(
                status: OwnerHomeStatus.ready,
                brand: brands.data.first,
              ),
      );
    } catch (error) {
      if (_isStale(generation)) return;
      emit(OwnerHomeState(status: OwnerHomeStatus.failed, error: error));
    }
  }

  /// The platform suspended [brandId]: turn read-only now. A load already in
  /// flight may predate the suspension, so it starts again.
  void markSuspended(String brandId) {
    if (state.status == OwnerHomeStatus.loading) {
      unawaited(load());
      return;
    }
    final brand = state.brand;
    if (brand == null || brand.id != brandId) return;
    emit(state.copyWith(brand: brand.withStatus(OwnerBrandStatus.suspended)));
  }

  /// Reads the shown brand again without a loading state, after the API said a
  /// brand is suspended. A failure keeps what is shown; the next one retries.
  Future<void> refreshBrand() async {
    final shownId = state.brand?.id;
    if (shownId == null || _isRefreshingBrand) return;
    _isRefreshingBrand = true;
    final generation = _loadGeneration;
    try {
      final brands = await _owner.getBrands();
      if (_isStale(generation)) return;
      for (final brand in brands.data) {
        if (brand.id == shownId) emit(state.copyWith(brand: brand));
      }
    } catch (_) {
    } finally {
      _isRefreshingBrand = false;
    }
  }

  bool _isStale(int generation) => isClosed || generation != _loadGeneration;

  Future<void> resubmit() async {
    final brand = state.brand;
    if (brand == null || !brand.canResubmit || state.isResubmitting) return;
    emit(state.copyWith(isResubmitting: true, clearErrors: true));
    try {
      final updated = await _owner.resubmitBrand(brand.id);
      if (isClosed) return;
      emit(
        OwnerHomeState(
          status: OwnerHomeStatus.ready,
          brand: updated,
          resubmitted: true,
        ),
      );
    } catch (error) {
      if (isClosed) return;
      emit(state.copyWith(isResubmitting: false, actionError: error));
    }
  }
}
