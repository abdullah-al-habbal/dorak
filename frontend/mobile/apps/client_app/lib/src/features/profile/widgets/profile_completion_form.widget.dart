import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/auth/auth_validators.entity.dart';
import 'package:client_app/src/features/auth/widgets/auth_text_field.widget.dart';

class ProfileCompletionForm extends StatelessWidget {
  const ProfileCompletionForm({
    super.key,
    required this.formKey,
    required this.nameController,
    required this.phoneController,
    required this.l10n,
  });
  final GlobalKey<FormState> formKey;
  final TextEditingController nameController;
  final TextEditingController phoneController;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) => Form(
    key: formKey,
    child: Column(
      children: [
        AuthTextField(
          label: l10n.profileCompletionNameLabel,
          controller: nameController,
          validator: (value) => AuthValidators.required(value, l10n),
        ),
        const SizedBox(height: DorakDimensions.spacingMedium),
        AuthTextField(
          label: l10n.profileCompletionPhoneLabel,
          controller: phoneController,
          keyboardType: TextInputType.phone,
          textInputAction: TextInputAction.done,
          validator: (value) => AuthValidators.required(value, l10n),
        ),
      ],
    ),
  );
}
