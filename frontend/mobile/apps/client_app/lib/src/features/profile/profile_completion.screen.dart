import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/profile/profile_completion.bloc.dart';
import 'package:client_app/src/features/profile/profile_completion.event.dart';
import 'package:client_app/src/features/profile/profile_completion.state.dart';
import 'package:client_app/src/features/profile/widgets/profile_completion_body.widget.dart';

class ProfileCompletionScreen extends StatefulWidget {
  const ProfileCompletionScreen({
    super.key,
    required this.bloc,
    required this.initialName,
    required this.initialPhone,
    required this.onCompleted,
  });

  final ProfileCompletionBloc bloc;
  final String initialName;
  final String? initialPhone;
  final ValueChanged<String?> onCompleted;

  @override
  State<ProfileCompletionScreen> createState() =>
      _ProfileCompletionScreenState();
}

class _ProfileCompletionScreenState extends State<ProfileCompletionScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _phoneController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.initialName);
    _phoneController = TextEditingController(text: widget.initialPhone ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<ProfileCompletionBloc, ProfileCompletionState>(
          bloc: widget.bloc,
          listener: (context, state) {
            if (state.completed) widget.onCompleted(state.phoneToVerify);
          },
          builder: (context, state) => ProfileCompletionBody(
            state: state,
            formKey: _formKey,
            nameController: _nameController,
            phoneController: _phoneController,
            onSubmit: _submit,
            errorMessage: _errorMessage,
          ),
        ),
      ),
    );
  }

  String _errorMessage(AppLocalizations l10n, Object error) {
    if (error is NetworkException) return l10n.errorNetwork;
    return l10n.profileCompletionError;
  }

  void _submit() {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    widget.bloc.add(
      ProfileCompletionSubmitted(
        name: _nameController.text.trim(),
        phone: _phoneController.text.trim(),
        currentPhone: widget.initialPhone ?? '',
      ),
    );
  }
}
