import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';

import 'package:client_app/src/core/formatting/locale_formatters.entity.dart';
import 'package:client_app/src/core/formatting/rating_label.entity.dart';
import 'package:client_app/src/features/booking/branch_booking_error.entity.dart';
import 'package:client_app/src/features/booking/branch_detail.bloc.dart';
import 'package:client_app/src/features/booking/branch_detail.event.dart';
import 'package:client_app/src/features/booking/branch_detail.state.dart';
import 'package:client_app/src/features/booking/widgets/at_home_booking_fields.widget.dart';
import 'package:client_app/src/features/booking/widgets/booking_summary.widget.dart';
import 'package:client_app/src/features/booking/widgets/branch_storefront.widget.dart';
import 'package:client_app/src/features/booking/widgets/chair_services.widget.dart';
import 'package:client_app/src/features/booking/widgets/floor_plan_grid.widget.dart';

class BranchDetailBody extends StatelessWidget {
  const BranchDetailBody({
    super.key,
    required this.bloc,
    required this.state,
    required this.onBarberSelected,
    required this.onFavorite,
  });
  final BranchDetailBloc bloc;
  final BranchDetailState state;
  final void Function(String barberId) onBarberSelected;
  final void Function(String favorableId, String favorableType) onFavorite;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    final detail = state.detail!;
    return ListView(
      padding: const EdgeInsets.all(DorakDimensions.marginMobile),
      children: [
        _BranchHeader(
          detail: detail,
          colors: colors,
          chairsLabel: l10n.branchChairsCount(detail.chairsCount),
          ratingLabel: RatingLabel.of(
            l10n,
            average: detail.ratingAvg,
            count: detail.ratingCount,
            localeCode: Localizations.localeOf(context).languageCode,
          ),
          onFavorite: onFavorite,
        ),
        BranchStorefront(detail: detail),
        const SizedBox(height: DorakDimensions.spacingLarge),
        _BookingModeSection(
          bloc: bloc,
          state: state,
          l10n: l10n,
          colors: colors,
        ),
        if (detail.barbers.isNotEmpty)
          _BarberSection(
            bloc: bloc,
            state: state,
            detail: detail,
            l10n: l10n,
            onBarberSelected: onBarberSelected,
            onFavorite: onFavorite,
          ),
        if (detail.services.isNotEmpty)
          _ServiceSelectionSection(
            bloc: bloc,
            state: state,
            services: detail.services,
            l10n: l10n,
            colors: colors,
          ),
        _PaymentMethodSection(l10n: l10n),
        const SizedBox(height: DorakDimensions.spacingLarge),
        _BookingSubmitSection(
          bloc: bloc,
          state: state,
          l10n: l10n,
          submitMessage: _submitMessage(context),
          onPickDate: () => _pickDate(context),
          onSubmit: () => bloc.add(const BranchDetailBookingSubmitted()),
        ),
      ],
    );
  }

  String _submitMessage(BuildContext context) => BranchBookingError.submitMessage(
    AppLocalizations.of(context)!,
    state.submitError,
  );

  Future<void> _pickDate(BuildContext context) async {
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      firstDate: now,
      lastDate: now.add(const Duration(days: 60)),
    );
    if (date == null || !context.mounted) return;
    bloc.add(BranchDetailDateChanged(date));
  }
}

class _BookingModeSection extends StatelessWidget {
  const _BookingModeSection({
    required this.bloc,
    required this.state,
    required this.l10n,
    required this.colors,
  });

  final BranchDetailBloc bloc;
  final BranchDetailState state;
  final AppLocalizations l10n;
  final DorakColors colors;

  FloorChairDto? get _selectedChair {
    final id = state.selectedChairId;
    if (id == null) return null;
    for (final chair in state.plan?.chairs ?? const <FloorChairDto>[]) {
      if (chair.id == id) return chair;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) => Column(
    children: [
      SwitchListTile(
        contentPadding: EdgeInsets.zero,
        title: Text(l10n.bookingAtHomeToggle),
        value: state.isAtHomeBooking,
        activeThumbColor: colors.primary,
        onChanged: (value) => bloc.add(BranchDetailBookingModeChanged(value)),
      ),
      const SizedBox(height: DorakDimensions.spacingSmall),
      if (state.isAtHomeBooking) ...[
        AtHomeBookingFields(bloc: bloc, state: state),
        const SizedBox(height: DorakDimensions.spacingLarge),
      ] else if (state.plan != null) ...[
        FloorPlanGrid(
          chairs: state.plan!.chairs,
          zones: state.plan!.floorPlan?.zones ?? const [],
          selectedChairId: state.selectedChairId,
          onChairSelected: (id) => bloc.add(BranchDetailChairSelected(id)),
          availableLabel: l10n.branchAvailableLabel,
          occupiedLabel: l10n.branchOccupiedLabel,
        ),
        if (_selectedChair case final chair?) ...[
          const SizedBox(height: DorakDimensions.spacingMedium),
          ChairServices(chair: chair, plan: state.plan!),
        ],
        const SizedBox(height: DorakDimensions.spacingLarge),
      ] else if (state.planFailed) ...[
        StatusBanner(
          message: l10n.errorNetwork,
          actionLabel: l10n.actionRetry,
          onAction: () => bloc.add(const BranchDetailRetried()),
        ),
        const SizedBox(height: DorakDimensions.spacingLarge),
      ],
    ],
  );
}

class _ServiceSelectionSection extends StatelessWidget {
  const _ServiceSelectionSection({
    required this.bloc,
    required this.state,
    required this.services,
    required this.l10n,
    required this.colors,
  });

  final BranchDetailBloc bloc;
  final BranchDetailState state;
  final List<BookingServiceDto> services;
  final AppLocalizations l10n;
  final DorakColors colors;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(l10n.bookingSelectServices, style: DorakTypography.titleLg),
      ...services.map(
        (service) => CheckboxListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(service.name),
          value: state.selectedServiceIds.contains(service.id),
          activeColor: colors.primary,
          onChanged: (selected) {
            final ids = List<String>.of(state.selectedServiceIds);
            if (selected == true) {
              ids.add(service.id);
            } else {
              ids.remove(service.id);
            }
            bloc.add(BranchDetailServicesChanged(ids));
          },
        ),
      ),
      const SizedBox(height: DorakDimensions.spacingMedium),
      BookingSummary(state: state),
      const SizedBox(height: DorakDimensions.spacingMedium),
    ],
  );
}

class _BookingSubmitSection extends StatelessWidget {
  const _BookingSubmitSection({
    required this.bloc,
    required this.state,
    required this.l10n,
    required this.submitMessage,
    required this.onPickDate,
    required this.onSubmit,
  });

  final BranchDetailBloc bloc;
  final BranchDetailState state;
  final AppLocalizations l10n;
  final String submitMessage;
  final VoidCallback onPickDate;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    final localeCode = Localizations.localeOf(context).languageCode;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(l10n.bookingSelectDate, style: DorakTypography.titleLg),
        const SizedBox(height: DorakDimensions.spacingSmall),
        SecondaryButton(
          label: state.selectedDate == null
              ? l10n.bookingSelectDate
              : LocaleFormatters.date(
                  state.selectedDate!.toLocal(),
                  localeCode,
                ),
          onPressed: onPickDate,
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        Text(l10n.bookingSelectTime, style: DorakTypography.titleLg),
        const SizedBox(height: DorakDimensions.spacingSmall),
        if (state.isLoadingSlots)
          const Center(child: CircularProgressIndicator())
        else if (BranchBookingError.atHomeMessage(l10n, state.slotsError)
            case final message?)
          StatusBanner(message: message)
        else if (state.slots.isEmpty)
          Text(l10n.bookingNoSlots, style: DorakTypography.bodyMd)
        else
          Wrap(
            spacing: DorakDimensions.spacingSmall,
            runSpacing: DorakDimensions.spacingSmall,
            children: state.slots.map((slot) {
              final selected =
                  state.selectedTime != null &&
                  slot.startsAt.isAtSameMomentAs(state.selectedTime!);
              return ChoiceChip(
                label: Text(
                  LocaleFormatters.time(slot.startsAt.toLocal(), localeCode),
                ),
                selected: selected,
                onSelected: (_) =>
                    bloc.add(BranchDetailSlotSelected(slot.startsAt)),
              );
            }).toList(),
          ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        if (state.submitError != null) ...[
          StatusBanner(message: submitMessage),
          const SizedBox(height: DorakDimensions.spacingSmall),
        ],
        PrimaryButton(
          label: l10n.bookingConfirmAction,
          onPressed: onSubmit,
          isDisabled: !state.canSubmit,
          isLoading: state.isSubmitting,
        ),
      ],
    );
  }
}

class _BranchHeader extends StatelessWidget {
  const _BranchHeader({
    required this.detail,
    required this.colors,
    required this.chairsLabel,
    required this.ratingLabel,
    required this.onFavorite,
  });
  final BranchDetailDto detail;
  final DorakColors colors;
  final String chairsLabel;
  final String ratingLabel;
  final void Function(String, String) onFavorite;
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        detail.name,
        style: DorakTypography.headlineLgMobile.copyWith(
          color: colors.onSurface,
        ),
      ),
      Align(
        alignment: Alignment.centerRight,
        child: IconButton(
          icon: const Icon(Icons.favorite_border),
          onPressed: () => onFavorite(detail.id.toString(), 'branch'),
        ),
      ),
      const SizedBox(height: 4),
      Text(
        ratingLabel,
        style: DorakTypography.bodyMd.copyWith(color: colors.primary),
      ),
      const SizedBox(height: 4),
      Text(
        chairsLabel,
        style: DorakTypography.bodyMd.copyWith(color: colors.onSurfaceVariant),
      ),
    ],
  );
}

class _BarberSection extends StatelessWidget {
  const _BarberSection({
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

class _PaymentMethodSection extends StatelessWidget {
  const _PaymentMethodSection({required this.l10n});
  final AppLocalizations l10n;
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(l10n.bookingPaymentTitle, style: DorakTypography.titleLg),
      const SizedBox(height: DorakDimensions.spacingSmall),
      Text(l10n.bookingPayAtSalon, style: DorakTypography.bodyLg),
      const SizedBox(height: DorakDimensions.spacingSmall),
      Text(l10n.bookingPayAtSalonOnly, style: DorakTypography.bodyMd),
    ],
  );
}
