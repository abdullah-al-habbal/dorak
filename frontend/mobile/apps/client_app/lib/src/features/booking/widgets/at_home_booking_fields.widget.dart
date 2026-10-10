import 'package:flutter/material.dart';
import 'package:localization/localization.dart';
import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:client_app/src/features/booking/branch_detail.bloc.dart';
import 'package:client_app/src/features/booking/branch_detail.event.dart';
import 'package:client_app/src/features/booking/branch_detail.state.dart';

class AtHomeBookingFields extends StatelessWidget {
  const AtHomeBookingFields({
    super.key,
    required this.bloc,
    required this.state,
  });
  final BranchDetailBloc bloc;
  final BranchDetailState state;
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final latitude = state.atHomeLatitude;
    final longitude = state.atHomeLongitude;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (state.savedAddresses.isNotEmpty) ...[
          DropdownButtonFormField<SavedAddress>(
            key: const Key('at-home-saved-addresses'),
            decoration: InputDecoration(
              labelText: l10n.bookingSavedAddressesLabel,
            ),
            items: state.savedAddresses
                .map(
                  (address) => DropdownMenuItem(
                    value: address,
                    child: Text(address.label),
                  ),
                )
                .toList(growable: false),
            onChanged: (address) {
              if (address != null) {
                bloc.add(BranchDetailSavedAddressSelected(address));
              }
            },
          ),
          const SizedBox(height: DorakDimensions.spacingMedium),
        ],
        TextField(
          key: const Key('at-home-street'),
          decoration: InputDecoration(labelText: l10n.bookingAtHomeStreetLabel),
          onChanged: (street) => _addressChanged(street: street),
        ),
        const SizedBox(height: DorakDimensions.spacingSmall),
        TextField(
          key: const Key('at-home-building'),
          decoration: InputDecoration(
            labelText: l10n.bookingAtHomeBuildingLabel,
          ),
          onChanged: (building) => _addressChanged(building: building),
        ),
        const SizedBox(height: DorakDimensions.spacingSmall),
        TextField(
          key: const Key('at-home-unit'),
          decoration: InputDecoration(labelText: l10n.bookingAtHomeUnitLabel),
          onChanged: (unit) => _addressChanged(unit: unit),
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        SecondaryButton(
          label: l10n.bookingAtHomePinAction,
          isDisabled: state.isLocating,
          onPressed: () =>
              bloc.add(const BranchDetailAtHomeLocationRequested()),
        ),
        if (latitude != null && longitude != null) ...[
          const SizedBox(height: DorakDimensions.spacingSmall),
          Text(
            l10n.bookingAtHomePinSelected(
              latitude.toStringAsFixed(6),
              longitude.toStringAsFixed(6),
            ),
            style: DorakTypography.bodyMd,
          ),
        ],
      ],
    );
  }

  void _addressChanged({String? street, String? building, String? unit}) =>
      bloc.add(
        BranchDetailAtHomeAddressChanged(
          street: street ?? state.atHomeStreet,
          building: building ?? state.atHomeBuilding,
          unit: unit ?? state.atHomeUnit,
        ),
      );
}
