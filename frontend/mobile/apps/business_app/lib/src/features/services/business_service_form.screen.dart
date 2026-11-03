import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/services/business_service_draft.entity.dart';
import 'package:business_app/src/features/services/business_services.bloc.dart';
import 'package:business_app/src/features/services/business_services.state.dart';
import 'package:business_app/src/features/shared/feature_error.widget.dart';
import 'package:design_system/design_system.dart';

/// Create (no [serviceId]) or edit a brand service. The service name is
/// returned in one locale only, so both names are re-entered when editing.
class BusinessServiceFormScreen extends StatefulWidget {
  const BusinessServiceFormScreen({
    super.key,
    required this.bloc,
    this.serviceId,
  });

  final BusinessServicesBloc bloc;
  final String? serviceId;

  @override
  State<BusinessServiceFormScreen> createState() =>
      _BusinessServiceFormScreenState();
}

class _BusinessServiceFormScreenState extends State<BusinessServiceFormScreen> {
  static const _defaultCurrency = 'USD';
  static const _defaultDuration = 30;

  final _formKey = GlobalKey<FormState>();
  final _nameEn = TextEditingController();
  final _nameAr = TextEditingController();
  final _price = TextEditingController();
  final _currency = TextEditingController(text: _defaultCurrency);
  final _duration = TextEditingController(text: '$_defaultDuration');
  bool _isAtHome = false;
  bool _isActive = true;

  BusinessServiceDto? get _existing {
    final id = widget.serviceId;
    if (id == null) return null;
    for (final service in widget.bloc.state.services) {
      if (service.id == id) return service;
    }
    return null;
  }

  @override
  void initState() {
    super.initState();
    final service = _existing;
    if (service == null) return;
    _nameEn.text = service.name;
    _price.text = MinorUnits.toMajor(service.priceAmountMinor).toString();
    _currency.text = service.currencyCode ?? _defaultCurrency;
    _duration.text = '${service.durationMinutes ?? _defaultDuration}';
    _isAtHome = service.isAtHome;
    _isActive = service.isActive;
  }

  @override
  void dispose() {
    _nameEn.dispose();
    _nameAr.dispose();
    _price.dispose();
    _currency.dispose();
    _duration.dispose();
    super.dispose();
  }

  String? _required(String? value, AppLocalizations l10n) =>
      (value == null || value.trim().isEmpty)
      ? l10n.staffServiceRequired
      : null;

  String? _number(String? value, AppLocalizations l10n) {
    final missing = _required(value, l10n);
    if (missing != null) return missing;
    final parsed = double.tryParse(value!.trim());
    return parsed == null || parsed < 0 ? l10n.staffServiceInvalidNumber : null;
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final router = GoRouter.of(context);
    final saved = await widget.bloc.save(
      BusinessServiceDraft(
        nameEn: _nameEn.text.trim(),
        nameAr: _nameAr.text.trim(),
        price: double.parse(_price.text.trim()),
        currencyCode: _currency.text.trim().toUpperCase(),
        durationMinutes: int.parse(_duration.text.trim()),
        isAtHome: _isAtHome,
        isActive: _isActive,
      ),
      id: widget.serviceId,
    );
    if (saved && mounted) router.pop();
  }

  Future<void> _delete() async {
    final l10n = AppLocalizations.of(context)!;
    final router = GoRouter.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.staffServiceDeleteTitle),
        content: Text(l10n.staffServiceDeleteMessage),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l10n.staffServiceCancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(l10n.staffServiceDelete),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    if (await widget.bloc.delete(widget.serviceId!) && mounted) router.pop();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final editing = widget.serviceId != null;
    return Scaffold(
      appBar: AppBar(
        title: Text(
          editing ? l10n.staffServiceEditTitle : l10n.staffServiceNewTitle,
        ),
        actions: [
          if (editing)
            IconButton(
              tooltip: l10n.staffServiceDelete,
              onPressed: _delete,
              icon: const Icon(Icons.delete_outline),
            ),
        ],
      ),
      body: BlocBuilder<BusinessServicesBloc, BusinessServicesState>(
        bloc: widget.bloc,
        builder: (context, state) => Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(DorakDimensions.spacingMedium),
            children: [
              TextFormField(
                controller: _nameEn,
                decoration: InputDecoration(labelText: l10n.staffServiceNameEn),
                validator: (value) => _required(value, l10n),
              ),
              TextFormField(
                controller: _nameAr,
                decoration: InputDecoration(labelText: l10n.staffServiceNameAr),
                validator: (value) => _required(value, l10n),
              ),
              TextFormField(
                controller: _price,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),
                decoration: InputDecoration(labelText: l10n.staffServicePrice),
                validator: (value) => _number(value, l10n),
              ),
              TextFormField(
                controller: _currency,
                textCapitalization: TextCapitalization.characters,
                decoration: InputDecoration(
                  labelText: l10n.staffServiceCurrency,
                ),
                validator: (value) => _required(value, l10n),
              ),
              TextFormField(
                controller: _duration,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: l10n.staffServiceDuration,
                ),
                validator: (value) {
                  final missing = _required(value, l10n);
                  if (missing != null) return missing;
                  final minutes = int.tryParse(value!.trim());
                  return minutes == null || minutes <= 0
                      ? l10n.staffServiceInvalidNumber
                      : null;
                },
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(l10n.staffServiceAtHome),
                value: _isAtHome,
                onChanged: (value) => setState(() => _isAtHome = value),
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(l10n.staffServiceActive),
                value: _isActive,
                onChanged: (value) => setState(() => _isActive = value),
              ),
              if (state.error != null) FeatureError(error: state.error!),
              const SizedBox(height: DorakDimensions.spacingMedium),
              FilledButton(
                onPressed: state.saving ? null : _submit,
                child: Text(l10n.staffServiceSave),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
