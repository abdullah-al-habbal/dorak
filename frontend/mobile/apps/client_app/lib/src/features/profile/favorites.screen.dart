import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:client_app/src/features/profile/favorites.bloc.dart';
import 'package:client_app/src/features/profile/widgets/favorites_view.widget.dart';

class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key, required this.bloc});

  final FavoritesBloc bloc;

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: bloc,
      child: FavoritesView(bloc: bloc),
    );
  }
}
