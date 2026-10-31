import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:stylist_app/src/features/portfolio/stylist_portfolio.bloc.dart';
import 'package:stylist_app/src/features/portfolio/stylist_portfolio.state.dart';
import 'package:stylist_app/src/features/portfolio/widgets/portfolio_photo_tile.widget.dart';
import 'package:stylist_app/src/features/shared/feature_error.widget.dart';
import 'package:stylist_app/src/features/shared/load_on_init.widget.dart';
import 'package:stylist_app/src/features/portfolio/stylist_portfolio_constants.entity.dart';

class StylistPortfolioScreen extends StatelessWidget {
  const StylistPortfolioScreen({super.key, required this.bloc});

  final StylistPortfolioBloc bloc;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LoadOnInit(
      onInit: bloc.load,
      child: Scaffold(
        appBar: AppBar(title: Text(l10n.stylistPortfolioTitle)),
        floatingActionButton:
            BlocBuilder<StylistPortfolioBloc, StylistPortfolioState>(
              bloc: bloc,
              builder: (context, state) => FloatingActionButton.extended(
                onPressed: state.uploading ? null : bloc.addPhoto,
                icon: const Icon(Icons.add_a_photo_outlined),
                label: Text(l10n.stylistPortfolioAdd),
              ),
            ),
        body: BlocBuilder<StylistPortfolioBloc, StylistPortfolioState>(
          bloc: bloc,
          builder: (context, state) {
            if (state.loading && state.photos.isEmpty) {
              return const Center(child: CircularProgressIndicator());
            }
            return Column(
              children: [
                if (state.error != null) FeatureError(error: state.error!),
                if (state.photos.isEmpty)
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(l10n.stylistPortfolioEmpty),
                  ),
                Expanded(
                  child: GridView.count(
                    crossAxisCount: StylistPortfolioConstants.columns,
                    padding: const EdgeInsets.all(8),
                    mainAxisSpacing: 8,
                    crossAxisSpacing: 8,
                    children: [
                      for (final photo in state.photos)
                        PortfolioPhotoTile(
                          key: ValueKey(photo.id),
                          photo: photo,
                          deleteLabel: l10n.stylistPortfolioDelete,
                          busy: state.deletingId != null,
                          onDelete: () => bloc.deletePhoto(photo.id),
                        ),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
