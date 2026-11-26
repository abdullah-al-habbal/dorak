import 'package:design_system/design_system.dart';
import 'package:feature_error_feedback/feature_error_feedback.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/profile/delete_account.bloc.dart';
import 'package:client_app/src/features/profile/delete_account.event.dart';
import 'package:client_app/src/features/profile/delete_account.state.dart';

class DeleteAccountScreen extends StatefulWidget {
  const DeleteAccountScreen({
    super.key,
    required this.bloc,
    required this.onDeleted,
  });

  final DeleteAccountBloc bloc;
  final VoidCallback onDeleted;

  @override
  State<DeleteAccountScreen> createState() => _DeleteAccountScreenState();
}

class _DeleteAccountScreenState extends State<DeleteAccountScreen> {
  final TextEditingController _password = TextEditingController();

  @override
  void dispose() {
    _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return BlocListener<DeleteAccountBloc, DeleteAccountState>(
      bloc: widget.bloc,
      listenWhen: (previous, current) =>
          !previous.succeeded && current.succeeded,
      listener: (context, state) => widget.onDeleted(),
      child: Scaffold(
        appBar: AppBar(
          title: Text(l10n.deleteAccountTitle),
          leading: BackButton(onPressed: () => context.pop()),
        ),
        body: BlocBuilder<DeleteAccountBloc, DeleteAccountState>(
          bloc: widget.bloc,
          builder: (context, state) => ListView(
            padding: const EdgeInsets.all(DorakDimensions.marginMobile),
            children: [
              Text(l10n.deleteAccountWarning, style: DorakTypography.bodyMd),
              const SizedBox(height: DorakDimensions.spacingMedium),
              TextField(
                controller: _password,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: l10n.deleteAccountPassword,
                ),
              ),
              const SizedBox(height: DorakDimensions.spacingMedium),
              if (state.error != null) ...[
                StatusBanner(
                  message: DeleteAccountErrorMessage.of(l10n, state.error!),
                ),
                const SizedBox(height: DorakDimensions.spacingSmall),
              ],
              PrimaryButton(
                label: l10n.deleteAccountConfirm,
                isLoading: state.isSubmitting,
                onPressed: () =>
                    widget.bloc.add(DeleteAccountSubmitted(_password.text)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
