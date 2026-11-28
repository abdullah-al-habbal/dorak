import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

/// The current password, asked for when the email is edited.
class ProfileEmailPasswordField extends StatelessWidget {
  const ProfileEmailPasswordField({super.key, required this.controller});

  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return TextField(
      controller: controller,
      obscureText: true,
      autofillHints: const [AutofillHints.password],
      decoration: InputDecoration(
        labelText: l10n.changePasswordCurrentLabel,
        helperText: l10n.profileEmailPasswordHint,
      ),
    );
  }
}
