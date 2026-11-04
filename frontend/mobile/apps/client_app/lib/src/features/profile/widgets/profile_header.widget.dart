import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:design_system/design_system.dart';

import 'package:client_app/src/features/profile/avatar.bloc.dart';
import 'package:client_app/src/features/profile/avatar.state.dart';
import 'package:client_app/src/features/profile/widgets/avatar_thumbnail.widget.dart';

class ProfileHeader extends StatelessWidget {
  const ProfileHeader({
    super.key,
    required this.avatar,
    required this.clientName,
    required this.onPickAvatar,
  });

  final AvatarBloc avatar;
  final String? clientName;
  final VoidCallback onPickAvatar;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    final name = clientName;
    final initial = (name == null || name.isEmpty)
        ? '?'
        : name.characters.first.toUpperCase();
    return Container(
      padding: const EdgeInsets.all(DorakDimensions.spacingMedium),
      decoration: BoxDecoration(
        color: colors.surfaceContainerLow,
        borderRadius: DorakDimensions.radiusMd,
      ),
      child: Row(
        children: [
          BlocBuilder<AvatarBloc, AvatarState>(
            bloc: avatar,
            builder: (context, avatarState) {
              return InkWell(
                onTap: onPickAvatar,
                customBorder: const CircleBorder(),
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    AvatarThumbnail(
                      avatarUrl: avatarState.avatarUrl,
                      initial: initial,
                    ),
                    Positioned(
                      right: 0,
                      bottom: 0,
                      child: Container(
                        width: DorakDimensions.spacingLarge,
                        height: DorakDimensions.spacingLarge,
                        decoration: BoxDecoration(
                          color: colors.surface,
                          shape: BoxShape.circle,
                          border: Border.all(color: colors.outline),
                        ),
                        child: avatarState.isUploading
                            ? const Center(child: AppLoader.inline())
                            : Icon(
                                Icons.camera_alt_outlined,
                                size: 14,
                                color: colors.primary,
                              ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(width: DorakDimensions.spacingMedium),
          Expanded(
            child: Text(
              (name == null || name.isEmpty) ? l10n.profileMemberLabel : name,
              style: DorakTypography.headlineLgMobile.copyWith(
                color: colors.onSurface,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
