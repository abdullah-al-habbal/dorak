import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/core/errors/api_error.entity.dart';
import 'package:business_app/src/features/barbers/manual_barber.bloc.dart';
import 'package:business_app/src/features/barbers/manual_barber.event.dart';
import 'package:business_app/src/features/barbers/manual_barber.state.dart';
import 'package:business_app/src/features/barbers/phone_number.entity.dart';

class ManualBarberForm extends StatefulWidget {
  const ManualBarberForm({super.key, required this.bloc, required this.state});

  final ManualBarberBloc bloc;
  final ManualBarberState state;

  @override
  State<ManualBarberForm> createState() => _ManualBarberFormState();
}

class _ManualBarberFormState extends State<ManualBarberForm> {
  final _nameEnController = TextEditingController();
  final _nameArController = TextEditingController();
  final _phoneController = TextEditingController();
  String? _phoneError;

  @override
  void dispose() {
    _nameEnController.dispose();
    _nameArController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    return ListView(
      padding: const EdgeInsets.all(DorakDimensions.marginMobile),
      children: [
        Text(l10n.managerManualBarberSubtitle, style: DorakTypography.bodyMd),
        const SizedBox(height: DorakDimensions.spacingLarge),
        TextField(
          controller: _nameEnController,
          decoration: InputDecoration(labelText: l10n.managerBarberNameEnglish),
          textCapitalization: TextCapitalization.words,
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        TextField(
          controller: _nameArController,
          decoration: InputDecoration(labelText: l10n.managerBarberNameArabic),
          textDirection: TextDirection.rtl,
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        TextField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          decoration: InputDecoration(
            labelText: l10n.managerBarberPhone,
            hintText: l10n.managerBarberPhoneHint,
            errorText: _phoneError,
          ),
        ),
        const SizedBox(height: DorakDimensions.spacingSmall),
        Text(
          l10n.managerBarberPhoneSharedNote,
          style: DorakTypography.bodyMd.copyWith(
            color: colors.onSurfaceVariant,
          ),
        ),
        if (widget.state.error != null) ...[
          const SizedBox(height: DorakDimensions.spacingMedium),
          StatusBanner(
            message: ApiError.from(
              widget.state.error!,
              l10n,
              fallbackMessage: l10n.managerBarberCreateError,
            ).message,
          ),
        ],
        const SizedBox(height: DorakDimensions.spacingLarge),
        PrimaryButton(
          label: l10n.managerBarberCreate,
          isLoading: widget.state.isSubmitting,
          onPressed: _submit,
        ),
      ],
    );
  }

  void _submit() {
    final l10n = AppLocalizations.of(context)!;
    final phone = PhoneNumber.normalize(_phoneController.text);
    if (phone == null) {
      setState(() => _phoneError = l10n.managerBarberPhoneInvalid);
      return;
    }
    setState(() => _phoneError = null);
    _phoneController.value = TextEditingValue(
      text: phone,
      selection: TextSelection.collapsed(offset: phone.length),
    );
    widget.bloc.add(
      ManualBarberSubmitted(
        nameEn: _nameEnController.text.trim(),
        nameAr: _nameArController.text.trim(),
        phone: phone,
      ),
    );
  }
}
