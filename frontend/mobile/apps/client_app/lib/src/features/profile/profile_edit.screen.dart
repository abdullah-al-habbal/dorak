import 'package:core/core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/profile/profile_edit.bloc.dart';

class ProfileEditScreen extends StatefulWidget {
  const ProfileEditScreen({
    super.key,
    required this.repository,
    required this.name,
    required this.phone,
  });
  final ProfileRepository repository;
  final String name;
  final String? phone;
  @override
  State<ProfileEditScreen> createState() => _ProfileEditScreenState();
}

class _ProfileEditScreenState extends State<ProfileEditScreen> {
  late final _name = TextEditingController(text: widget.name);
  late final _phone = TextEditingController(text: widget.phone ?? '');
  late final ProfileEditCubit _cubit;

  @override
  void initState() {
    super.initState();
    _cubit = ProfileEditCubit(widget.repository);
  }

  Future<void> _save() async {
    await _cubit.save(name: _name.text.trim(), phone: _phone.text.trim());
    if (mounted && _cubit.state.saved) Navigator.pop(context);
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _cubit.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return BlocBuilder<ProfileEditCubit, ProfileEditState>(
      bloc: _cubit,
      builder: (context, state) => Scaffold(
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
                controller: _phone,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  labelText: l10n.profilePhoneNumberLabel,
                ),
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: state.isSaving ? null : _save,
                child: Text(l10n.profileSaveAction),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
