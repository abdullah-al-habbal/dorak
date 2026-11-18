import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/owner/owner_error.entity.dart';
import 'package:business_app/src/features/owner/owner_services.bloc.dart';
import 'package:business_app/src/features/owner/owner_services.state.dart';

class OwnerServiceFormScreen extends StatefulWidget {
  const OwnerServiceFormScreen({
    super.key,
    required this.bloc,
    required this.brandId,
    this.service,
    required this.onDone,
  });

  final OwnerServicesCubit bloc;
  final String brandId;
  final BusinessServiceDto? service;
  final VoidCallback onDone;

  @override
  State<OwnerServiceFormScreen> createState() => _OwnerServiceFormScreenState();
}

class _OwnerServiceFormScreenState extends State<OwnerServiceFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late final _nameEn = TextEditingController(text: widget.service?.name ?? '');
  late final _nameAr = TextEditingController(text: widget.service?.name ?? '');
  late final _price = TextEditingController(
    text: widget.service == null
        ? ''
        : MinorUnits.toMajor(widget.service!.priceAmountMinor).toString(),
  );
  late final _currency = TextEditingController(
    text: widget.service?.currencyCode ?? '',
  );
  late final _duration = TextEditingController(
    text: widget.service?.durationMinutes?.toString() ?? '',
  );

  @override
  void dispose() {
    _nameEn.dispose();
    _nameAr.dispose();
    _price.dispose();
    _currency.dispose();
    _duration.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState?.validate() != true) return;
    widget.bloc.save(
      id: widget.service?.id,
      brandId: widget.brandId,
      nameEn: _nameEn.text.trim(),
      nameAr: _nameAr.text.trim(),
      price: double.parse(_price.text.trim()),
      currencyCode: _currency.text.trim().toUpperCase(),
      durationMinutes: int.parse(_duration.text.trim()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    String? required(String? value) =>
        value == null || value.trim().isEmpty ? l10n.fieldRequired : null;
    String? number(String? value) {
      final missing = required(value);
      if (missing != null) return missing;
      return num.tryParse(value!.trim()) == null
          ? l10n.ownerFieldInvalidNumber
          : null;
    }

    return BlocConsumer<OwnerServicesCubit, OwnerServicesState>(
      bloc: widget.bloc,
      listenWhen: (previous, current) => !previous.saved && current.saved,
      listener: (context, state) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(l10n.ownerServiceSaved)));
        widget.onDone();
      },
      builder: (context, state) => Scaffold(
        appBar: AppBar(
          title: Text(
            widget.service == null
                ? l10n.ownerServiceAdd
                : l10n.ownerServiceEdit,
          ),
        ),
        body: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(DorakDimensions.marginMobile),
            children: [
              TextFormField(
                controller: _nameEn,
                decoration: InputDecoration(labelText: l10n.ownerBranchNameEn),
                validator: required,
              ),
              const SizedBox(height: DorakDimensions.spacingMedium),
              TextFormField(
                controller: _nameAr,
                decoration: InputDecoration(labelText: l10n.ownerBranchNameAr),
                validator: required,
              ),
              const SizedBox(height: DorakDimensions.spacingMedium),
              TextFormField(
                controller: _price,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),
                decoration: InputDecoration(labelText: l10n.ownerServicePrice),
                validator: number,
              ),
              const SizedBox(height: DorakDimensions.spacingMedium),
              TextFormField(
                controller: _currency,
                textCapitalization: TextCapitalization.characters,
                decoration: InputDecoration(
                  labelText: l10n.ownerServiceCurrency,
                ),
                validator: required,
              ),
              const SizedBox(height: DorakDimensions.spacingMedium),
              TextFormField(
                controller: _duration,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: l10n.ownerServiceDuration,
                ),
                validator: number,
              ),
              if (state.error != null) ...[
                const SizedBox(height: DorakDimensions.spacingMedium),
                StatusBanner(message: OwnerError.message(l10n, state.error!)),
              ],
              const SizedBox(height: DorakDimensions.spacingLarge),
              PrimaryButton(
                label: l10n.ownerServiceSave,
                isLoading: state.isSaving,
                onPressed: _submit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
