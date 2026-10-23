import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:client_app/src/features/discovery/discovery.bloc.dart';
import 'package:client_app/src/features/discovery/widgets/discovery_view.widget.dart';

class DiscoveryScreen extends StatelessWidget {
  const DiscoveryScreen({
    super.key,
    required this.bloc,
    required this.onLocaleToggle,
    required this.onBookNow,
    this.onViewDetails,
    this.onViewStylist,
  });

  final DiscoveryBloc bloc;
  final VoidCallback onLocaleToggle;
  final VoidCallback onBookNow;
  final ValueChanged<String>? onViewDetails;
  final ValueChanged<String>? onViewStylist;

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: bloc,
      child: DiscoveryView(
        bloc: bloc,
        onLocaleToggle: onLocaleToggle,
        onBookNow: onBookNow,
        onViewDetails: onViewDetails,
        onViewStylist: onViewStylist,
      ),
    );
  }
}
