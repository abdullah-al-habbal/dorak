import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:client_app/src/features/auth/auth_shell_constants.entity.dart';

// todo: this file must only have the AuthShell widget, we must create two spearted files one for the AuthShell and one for the _ResponsiveAuthContent
class AuthShell extends StatelessWidget {
  final Widget? header;
  final double? headerSpacing;
  final Widget child;
  final bool pinnedHeader;

  const AuthShell({
    super.key,
    this.header,
    this.headerSpacing,
    required this.child,
    this.pinnedHeader = false,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: pinnedHeader
          ? Column(
              children: [
                ?header,
                Expanded(child: _ResponsiveAuthContent(body: child)),
              ],
            )
          : _ResponsiveAuthContent(
              body: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ?header,
                  if (headerSpacing != null) SizedBox(height: headerSpacing!),
                  child,
                ],
              ),
            ),
    );
  }
}

class _ResponsiveAuthContent extends StatelessWidget {
  final Widget body;

  const _ResponsiveAuthContent({required this.body});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final available = constraints.maxHeight.isFinite
            ? math.max(
                0.0,
                constraints.maxHeight - AuthShellConstants.verticalMargin * 2,
              )
            : 0.0;

        return SingleChildScrollView(
          padding: const EdgeInsets.symmetric(
            horizontal: AuthShellConstants.horizontalMargin,
            vertical: AuthShellConstants.verticalMargin,
          ),
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: available),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(
                  maxWidth: AuthShellConstants.maxContentWidth,
                ),
                child: body,
              ),
            ),
          ),
        );
      },
    );
  }
}
