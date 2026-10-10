import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:core/core.dart';
import 'package:design_system/design_system.dart';

import 'package:client_app/src/features/profile/favorites.bloc.dart';

class FavoritesView extends StatelessWidget {
  const FavoritesView({super.key, required this.bloc});

  final FavoritesBloc bloc;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colors = DorakColors.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l10n.favoritesActionLabel)),
      body: BlocBuilder<FavoritesBloc, Paged<ClientFavoriteDto>>(
        bloc: bloc,
        builder: (context, state) {
          if (state.isFirstLoad) {
            bloc.load();
            return const AppLoader.page();
          }
          if (state.isEmpty) {
            return StatusView(
              icon: Icons.favorite_border_outlined,
              title: l10n.favoritesTitle,
              message: l10n.favoritesSubtitle,
              iconColor: colors.primary,
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(DorakDimensions.marginMobile),
            itemCount: state.items.length,
            separatorBuilder: (_, _) =>
                const SizedBox(height: DorakDimensions.spacingSmall),
            itemBuilder: (context, index) {
              final favorite = state.items[index];
              final favorable = favorite.favorable;
              final name =
                  favorable?['name'] as String? ?? favorite.favorableId;
              return ListTile(
                leading: Icon(Icons.favorite, color: colors.primary),
                title: Text(name),
                subtitle: Text(favorite.favorableType),
                trailing: IconButton(
                  icon: const Icon(Icons.favorite),
                  onPressed: () => bloc.remove(favorite.id),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
