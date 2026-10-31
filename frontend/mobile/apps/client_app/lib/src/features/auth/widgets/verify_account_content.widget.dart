import 'dart:async';

import 'package:flutter/material.dart';

import 'package:design_system/design_system.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/auth/auth_error.entity.dart';
import 'package:client_app/src/features/auth/widgets/verification_actions.widget.dart';
import 'package:client_app/src/features/auth/widgets/verification_code_fields.widget.dart';
import 'package:client_app/src/features/auth/widgets/verification_header.widget.dart';
import 'package:client_app/src/features/auth/auth_code_constants.entity.dart';

class VerifyAccountContent extends StatefulWidget {
  final String destination;
  final void Function(String code) onVerify;
  final void Function() onResend;
  final AuthError? error;
  final bool isVerifying;
  final VoidCallback onSkip;

  const VerifyAccountContent({
    super.key,
    required this.destination,
    required this.onVerify,
    required this.onResend,
    required this.error,
    required this.isVerifying,
    required this.onSkip,
  });

  @override
  State<VerifyAccountContent> createState() => _VerifyAccountContentState();
}

class _VerifyAccountContentState extends State<VerifyAccountContent> {
  late final List<TextEditingController> _controllers;
  late final List<FocusNode> _focusNodes;

  Timer? _cooldownTimer;
  int _cooldown = AuthCodeConstants.resendCooldownSeconds;
  AuthError? _error;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(
      AuthCodeConstants.codeLength,
      (_) => TextEditingController(),
    );
    _focusNodes = List.generate(
      AuthCodeConstants.codeLength,
      (_) => FocusNode(),
    );
    _error = widget.error;
    _startCooldown();
  }

  @override
  void dispose() {
    _cooldownTimer?.cancel();
    for (final controller in _controllers) {
      controller.dispose();
    }
    for (final node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant VerifyAccountContent oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!identical(oldWidget.error, widget.error)) {
      _error = widget.error;
    }
  }

  void _startCooldown() {
    _cooldownTimer?.cancel();
    setState(() => _cooldown = AuthCodeConstants.resendCooldownSeconds);
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() => _cooldown -= 1);
      if (_cooldown <= 0) timer.cancel();
    });
  }

  String get _code => _controllers.map((c) => c.text).join();

  String get _maskedDestination {
    final value = widget.destination.trim();
    final at = value.indexOf('@');
    if (at > 0) {
      return '${value[0]}***${value.substring(at)}';
    }
    if (value.length > 2) {
      return '${value[0]}***${value[value.length - 1]}';
    }
    return value;
  }

  void _onDigitChanged(int index, String value) {
    setState(() => _error = null);

    if (value.isNotEmpty && index < AuthCodeConstants.codeLength - 1) {
      _focusNodes[index + 1].requestFocus();
    } else if (value.isNotEmpty) {
      _focusNodes[index].unfocus();
    } else if (index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
  }

  void _onBackspaceWhenEmpty(int index) {
    if (index == 0) return;
    _controllers[index - 1].clear();
    _focusNodes[index - 1].requestFocus();
  }

  void _verify() {
    final l10n = AppLocalizations.of(context)!;
    final code = _code;
    if (code.length < AuthCodeConstants.codeLength) {
      setState(() => _error = AuthError(message: l10n.verifyErrorInvalid));
      return;
    }

    setState(() => _error = null);
    widget.onVerify(code);
  }

  void _resend() {
    setState(() => _error = null);
    widget.onResend();
    _startCooldown();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    final busy = widget.isVerifying;
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        VerificationHeader(
          destination: _maskedDestination,
          l10n: l10n,
          colors: colors,
        ),
        const SizedBox(height: 24),
        VerificationCodeFields(
          codeLength: AuthCodeConstants.codeLength,
          controllers: _controllers,
          focusNodes: _focusNodes,
          enabled: !busy,
          hasError: _error != null,
          onDigitChanged: _onDigitChanged,
          onBackspaceWhenEmpty: _onBackspaceWhenEmpty,
        ),
        const SizedBox(height: 16),
        VerificationActions(
          error: _error,
          l10n: l10n,
          colors: colors,
          busy: busy,
          cooldown: _cooldown,
          onVerify: _verify,
          onResend: _resend,
          onSkip: widget.onSkip,
        ),
      ],
    );
  }
}
