import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/booking/branch_detail.bloc.dart';
import 'package:client_app/src/features/booking/branch_detail.event.dart';
import 'package:client_app/src/features/booking/branch_detail.state.dart';

class BarberSection extends StatelessWidget {
  const BarberSection({
    super.key,
    required this.bloc,
    required this.state,
    required this.detail,
    required this.l10n,
    required this.onBarberSelected,
    required this.onFavorite,
  });
  final BranchDetailBloc bloc;
  final BranchDetailState state;
  final BranchDetailDto detail;
  final AppLocalizations l10n;
  final void Function(String) onBarberSelected;
  final void Function(String, String) onFavorite;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(l10n.branchBarbersTitle, style: DorakTypography.titleLg),
      const SizedBox(height: DorakDimensions.spacingSmall),
      Text(l10n.bookingPreferredBarber, style: DorakTypography.labelLg),
      const SizedBox(height: DorakDimensions.spacingSmall),
      Wrap(
        spacing: DorakDimensions.spacingSmall,
        runSpacing: DorakDimensions.spacingSmall,
        children: [
          ChoiceChip(
            label: Text(l10n.bookingFirstAvailable),
            selected: state.preferredBarberId == null,
            onSelected: (_) =>
                bloc.add(const BranchDetailBarberPreferenceChanged(null)),
          ),
          ...detail.barbers.map(
            (barber) => ChoiceChip(
              label: Text(barber.name),
              selected: state.preferredBarberId == barber.id,
              onSelected: (selected) => bloc.add(
                BranchDetailBarberPreferenceChanged(
                  selected ? barber.id : null,
                ),
              ),
            ),
          ),
        ],
      ),
      const SizedBox(height: DorakDimensions.spacingMedium),
      ...detail.barbers.map(
        (barber) => ListTile(
          contentPadding: EdgeInsets.zero,
          leading: CircleAvatar(
            child: Text(barber.name.characters.firstOrNull ?? '?'),
          ),
          title: Text(barber.name),
          trailing: IconButton(
            icon: const Icon(Icons.favorite_border),
            onPressed: () => onFavorite(barber.id, 'barber'),
          ),
          onTap: () => onBarberSelected(barber.id),
        ),
      ),
      const SizedBox(height: DorakDimensions.spacingLarge),
    ],
  );
}
