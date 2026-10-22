import 'package:core/core.dart';
import 'package:design_system/design_system.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/auth/auth_error.entity.dart';
import 'package:client_app/src/features/profile/profile_edit.bloc.dart';

class ProfileEditScreen extends StatefulWidget {
  const ProfileEditScreen({
    super.key,
    required this.repository,
    required this.name,
    required this.phone,
    this.email = '',
    this.onSaved,
    this.onEmailVerificationRequired,
    this.onPhoneVerificationRequired,
    this.phoneVerified = false,
  });
  final ProfileRepository repository;
  final String name;
  final String? phone;
  final String email;
  final ValueChanged<ClientDto>? onSaved;
  final ValueChanged<String>? onEmailVerificationRequired;
  final ValueChanged<String>? onPhoneVerificationRequired;
  final bool phoneVerified;
  @override
  State<ProfileEditScreen> createState() => _ProfileEditScreenState();
}

class _ProfileEditScreenState extends State<ProfileEditScreen> {
  late final _name = TextEditingController(text: widget.name);
  late final _phone = TextEditingController(text: widget.phone ?? '');
  late final _email = TextEditingController(text: widget.email);
  late final ProfileEditCubit _cubit;

  @override
  void initState() {
    super.initState();
    _cubit = ProfileEditCubit(
      widget.repository,
      initialEmail: widget.email,
      initialPhone: widget.phone ?? '',
    );
  }

  Future<void> _save() async {
    await _cubit.save(
      name: _name.text.trim(),
      phone: _phone.text.trim(),
      email: _email.text,
    );
    final state = _cubit.state;
    if (!mounted || !state.saved) return;
    final client = state.client;
    if (client != null) widget.onSaved?.call(client);
    Navigator.pop(context);
    final phone = state.phoneToVerify;
    if (state.needsEmailVerification) {
      widget.onEmailVerificationRequired?.call(client?.email ?? _email.text);
    } else if (phone != null) {
      widget.onPhoneVerificationRequired?.call(phone);
    }
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _email.dispose();
    _cubit.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return BlocBuilder<ProfileEditCubit, ProfileEditState>(
      bloc: _cubit,
      builder: (context, state) {
        final error = state.error;
        return Scaffold(
          appBar: AppBar(title: Text(l10n.profileEditTitle)),
          body: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                TextField(
                  controller: _name,
                  decoration: InputDecoration(
                    labelText: l10n.profileFullNameLabel,
                  ),
                ),
                TextField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    labelText: l10n.profileEmailLabel,
                  ),
                ),
                TextField(
                  controller: _phone,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(
                    labelText: l10n.profilePhoneNumberLabel,
                    helperText: l10n.profilePhoneChangeHint,
                    suffixText: widget.phoneVerified
                        ? l10n.profilePhoneVerifiedLabel
                        : null,
                  ),
                ),
                if (error != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    AuthError.from(error, l10n).message,
                    style: TextStyle(color: DorakColors.of(context).error),
                  ),
                ],
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: state.isSaving ? null : _save,
                  child: Text(l10n.profileSaveAction),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
