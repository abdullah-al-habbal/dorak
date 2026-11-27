import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/core/formatting/locale_formatters.entity.dart';
import 'package:client_app/src/features/booking/branch_booking_error.entity.dart';
import 'package:client_app/src/features/booking/branch_detail.bloc.dart';
import 'package:client_app/src/features/booking/branch_detail.event.dart';
import 'package:client_app/src/features/booking/branch_detail.state.dart';

class BookingSubmitSection extends StatelessWidget {
  const BookingSubmitSection({
    super.key,
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
                  LocaleFormatters.time(
                    slot.startsAtOnBranchClock,
                    localeCode,
                  ),
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
        if (!state.hasSelectedService) ...[
          Text(l10n.bookingSelectServiceHint, style: DorakTypography.bodyMd),
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
