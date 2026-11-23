import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/owner/owner_branches.bloc.dart';
import 'package:business_app/src/features/owner/owner_branches.state.dart';
import 'package:business_app/src/features/owner/owner_error.entity.dart';

/// Create (no [branch]) or edit a branch. The branch login password is required
/// when creating and optional when editing.
class OwnerBranchFormScreen extends StatefulWidget {
  const OwnerBranchFormScreen({
    super.key,
    required this.bloc,
    required this.brandId,
    this.branch,
    required this.onDone,
  });

  final OwnerBranchesCubit bloc;
  final String brandId;
  final OwnerBranchDto? branch;
  final VoidCallback onDone;

  @override
  State<OwnerBranchFormScreen> createState() => _OwnerBranchFormScreenState();
}

class _OwnerBranchFormScreenState extends State<OwnerBranchFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late final _nameEn = TextEditingController(
    text: widget.branch?.name[LocaleCodes.english] ?? '',
  );
  late final _nameAr = TextEditingController(
    text: widget.branch?.name[LocaleCodes.arabic] ?? '',
  );
  late final _email = TextEditingController(text: widget.branch?.email ?? '');
  final _password = TextEditingController();

  @override
  void dispose() {
    _nameEn.dispose();
    _nameAr.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState?.validate() != true) return;
    widget.bloc.save(
      id: widget.branch?.id,
      brandId: widget.brandId,
      nameEn: _nameEn.text.trim(),
      nameAr: _nameAr.text.trim(),
      email: _email.text.trim(),
      password: _password.text,
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final editing = widget.branch != null;
    String? required(String? value) =>
        value == null || value.trim().isEmpty ? l10n.fieldRequired : null;
    return BlocConsumer<OwnerBranchesCubit, OwnerBranchesState>(
      bloc: widget.bloc,
      listenWhen: (previous, current) => !previous.saved && current.saved,
      listener: (context, state) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(l10n.ownerBranchSaved)));
        widget.onDone();
      },
      builder: (context, state) => Scaffold(
        appBar: AppBar(
          title: Text(editing ? l10n.ownerBranchEdit : l10n.ownerBranchAdd),
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
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(labelText: l10n.ownerBranchEmail),
                validator: required,
              ),
              const SizedBox(height: DorakDimensions.spacingMedium),
              TextFormField(
                controller: _password,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: l10n.ownerBranchPassword,
                  helperText: editing ? l10n.ownerBranchPasswordKeep : null,
                ),
                validator: editing ? null : required,
              ),
              if (state.error != null) ...[
                const SizedBox(height: DorakDimensions.spacingMedium),
                StatusBanner(message: OwnerError.message(l10n, state.error!)),
              ],
              const SizedBox(height: DorakDimensions.spacingLarge),
              PrimaryButton(
                label: l10n.ownerBranchSave,
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
