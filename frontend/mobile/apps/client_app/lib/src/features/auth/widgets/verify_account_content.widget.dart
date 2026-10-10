import 'dart:async';

import 'package:flutter/material.dart';

import 'package:design_system/design_system.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/auth/auth_error.entity.dart';
import 'package:client_app/src/features/auth/widgets/otp_input_field.widget.dart';

class VerifyAccountContent extends StatefulWidget {
  static const int codeLength = 6;
  static const int resendCooldownSeconds = 60;

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
  int _cooldown = VerifyAccountContent.resendCooldownSeconds;
  AuthError? _error;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(
      VerifyAccountContent.codeLength,
      (_) => TextEditingController(),
    );
    _focusNodes = List.generate(
      VerifyAccountContent.codeLength,
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
    setState(() => _cooldown = VerifyAccountContent.resendCooldownSeconds);
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

    if (value.isNotEmpty && index < VerifyAccountContent.codeLength - 1) {
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
    if (code.length < VerifyAccountContent.codeLength) {
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
        _VerificationHeader(
          destination: _maskedDestination,
          l10n: l10n,
          colors: colors,
        ),
        const SizedBox(height: 24),
        _VerificationCodeFields(
          controllers: _controllers,
          focusNodes: _focusNodes,
          enabled: !busy,
          hasError: _error != null,
          onDigitChanged: _onDigitChanged,
          onBackspaceWhenEmpty: _onBackspaceWhenEmpty,
        ),
        const SizedBox(height: 16),
        _VerificationActions(
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

class _VerificationHeader extends StatelessWidget {
  const _VerificationHeader({
    required this.destination,
    required this.l10n,
    required this.colors,
  });

  final String destination;
  final AppLocalizations l10n;
  final DorakColors colors;

  @override
  Widget build(BuildContext context) => Column(
    children: [
      Icon(Icons.mark_email_read, size: 48, color: colors.primary),
      const SizedBox(height: 16),
      Text(
        l10n.verifyTitle,
        style: DorakTypography.headlineSm.copyWith(color: colors.onSurface),
        textAlign: TextAlign.center,
      ),
      const SizedBox(height: 8),
      Text(
        l10n.verifySubtitle(destination),
        style: DorakTypography.bodyMd.copyWith(color: colors.onSurfaceVariant),
        textAlign: TextAlign.center,
      ),
    ],
  );
}

class _VerificationCodeFields extends StatelessWidget {
  const _VerificationCodeFields({
    required this.controllers,
    required this.focusNodes,
    required this.enabled,
    required this.hasError,
    required this.onDigitChanged,
    required this.onBackspaceWhenEmpty,
  });

  final List<TextEditingController> controllers;
  final List<FocusNode> focusNodes;
  final bool enabled;
  final bool hasError;
  final void Function(int index, String value) onDigitChanged;
  final void Function(int index) onBackspaceWhenEmpty;

  @override
  Widget build(BuildContext context) => Row(
    children: [
      for (var i = 0; i < VerifyAccountContent.codeLength; i++) ...[
        if (i > 0) const SizedBox(width: 8),
        Expanded(
          child: OtpInputField(
            controller: controllers[i],
            focusNode: focusNodes[i],
            autofocus: i == 0,
            enabled: enabled,
            hasError: hasError,
            onChanged: (value) => onDigitChanged(i, value),
            onBackspaceWhenEmpty: () => onBackspaceWhenEmpty(i),
          ),
        ),
      ],
    ],
  );
}

class _VerificationActions extends StatelessWidget {
  const _VerificationActions({
    required this.error,
    required this.l10n,
    required this.colors,
    required this.busy,
    required this.cooldown,
    required this.onVerify,
    required this.onResend,
    required this.onSkip,
  });

  final AuthError? error;
  final AppLocalizations l10n;
  final DorakColors colors;
  final bool busy;
  final int cooldown;
  final VoidCallback onVerify;
  final VoidCallback onResend;
  final VoidCallback onSkip;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      SizedBox(
        height: 24,
        child: error == null ? null : StatusBanner(message: error!.message),
      ),
      const SizedBox(height: 8),
      PrimaryButton(
        label: l10n.verifyButton,
        onPressed: onVerify,
        isLoading: busy,
      ),
      const SizedBox(height: 12),
      Wrap(
        alignment: WrapAlignment.center,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          Text(
            l10n.verifyDidNotReceive,
            style: DorakTypography.bodyMd.copyWith(
              color: colors.onSurfaceVariant,
            ),
          ),
          TextButton(
            onPressed: (cooldown > 0 || busy) ? null : onResend,
            style: TextButton.styleFrom(
              foregroundColor: colors.primary,
              textStyle: DorakTypography.labelLg,
              padding: const EdgeInsets.symmetric(horizontal: 8),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Text(
              cooldown > 0
                  ? l10n.verifyResendDisabled(cooldown)
                  : l10n.verifyResend,
            ),
          ),
        ],
      ),
      const SizedBox(height: 4),
      SkipButton(label: l10n.verifySkip, onPressed: onSkip, isDisabled: busy),
    ],
  );
}
