import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:business_app/src/features/owner/owner_home.state.dart';

/// Decides what the owner sees first: the brand with its approval banner, a pointer to
/// the web registration for an account with no brand, or an error.
class OwnerHomeCubit extends Cubit<OwnerHomeState> {
  OwnerHomeCubit(this._owner) : super(const OwnerHomeState());

  final OwnerRepository _owner;

  Future<void> load() async {
    emit(const OwnerHomeState());
    try {
      final access = await _owner.resolveAccess();
      if (access is! OwnerAccessGranted) {
        if (!isClosed) {
          emit(const OwnerHomeState(status: OwnerHomeStatus.noBrand));
        }
        return;
      }
      final brands = await _owner.getBrands();
      if (isClosed) return;
      emit(
        brands.isEmpty
            ? const OwnerHomeState(status: OwnerHomeStatus.noBrand)
            : OwnerHomeState(
                status: OwnerHomeStatus.ready,
                brand: brands.data.first,
              ),
      );
    } catch (error) {
      if (isClosed) return;
      emit(OwnerHomeState(status: OwnerHomeStatus.failed, error: error));
    }
  }

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
