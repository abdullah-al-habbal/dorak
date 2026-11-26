import 'dart:async';

import 'package:core/core.dart';

import 'package:business_app/src/features/owner/app_role.entity.dart';
import 'package:business_app/src/features/owner/owner_home.bloc.dart';

/// Reacts to a brand being suspended while someone is signed in. A branch
/// manager cannot keep working, so [onBranchSuspended] ends the session; an
/// owner stays signed in and the brand turns read-only.
///
/// The realtime event is the fast path. The API's `brand_suspended` answer is
/// the fallback when the event does not arrive; a branch also gets
/// `ACCOUNT_NOT_ACTIVE`, which `StaffSessionSignals` handles.
class BrandSuspensionMonitor {
  BrandSuspensionMonitor({
    required ApiClient client,
    required RealtimeClient? realtime,
    required AppRole Function() role,
    required BranchOperationsRepository branch,
    required OwnerRepository owner,
    required OwnerHomeCubit ownerHome,
    required Future<void> Function() onBranchSuspended,
  }) : this._(
         client,
         realtime,
         role,
         branch,
         owner,
         ownerHome,
         onBranchSuspended,
       );

  BrandSuspensionMonitor._(
    ApiClient client,
    this._realtime,
    this._role,
    this._branch,
    this._owner,
    this._ownerHome,
    this._onBranchSuspended,
  ) {
    _fallback = client.brandSuspendedStream.listen((_) {
      if (_role() == AppRole.owner) {
        unawaited(_ownerHome.refreshBrand());
      } else {
        unawaited(_onBranchSuspended());
      }
    });
  }

  final RealtimeClient? _realtime;
  final AppRole Function() _role;
  final BranchOperationsRepository _branch;
  final OwnerRepository _owner;
  final OwnerHomeCubit _ownerHome;
  final Future<void> Function() _onBranchSuspended;
  late final StreamSubscription<void> _fallback;
  RealtimeSubscription? _channel;
  int _generation = 0;

  /// Listens on the signed-in account's private channel. A failed id lookup
  /// leaves the HTTP answers as the only signal.
  Future<void> start() async {
    stop();
    final realtime = _realtime;
    if (realtime == null) return;
    final generation = _generation;
    try {
      if (_role() == AppRole.owner) {
        final clientId = (await _owner.me()).clientId;
        if (generation != _generation || clientId == null) return;
        _channel = realtime.subscribeToClient(clientId, _onOwnerEvent);
      } else {
        final branchId = (await _branch.getProfile()).id;
        if (generation != _generation) return;
        _channel = realtime.subscribeToBranch(branchId, _onBranchEvent);
      }
    } catch (_) {}
  }

  /// Drops the channel at the end of a session.
  void stop() {
    _generation++;
    _channel?.cancel();
    _channel = null;
  }

  Future<void> dispose() async {
    stop();
    await _fallback.cancel();
  }

  void _onOwnerEvent(String event, Map<String, dynamic> payload) {
    final brandId = payload['brandId'];
    if (event == RealtimeEvents.brandSuspended && brandId is String) {
      _ownerHome.markSuspended(brandId);
    }
  }

  void _onBranchEvent(String event, Map<String, dynamic> payload) {
    if (event == RealtimeEvents.brandSuspended) {
      unawaited(_onBranchSuspended());
    }
  }
}
