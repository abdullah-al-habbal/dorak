import 'package:design_system/design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:localization/localization.dart';

import 'package:business_app/src/features/barbers/manual_barber.bloc.dart';
import 'package:business_app/src/features/barbers/manual_barber.state.dart';
import 'package:business_app/src/features/barbers/widgets/manual_barber_form.widget.dart';

class ManualBarberScreen extends StatelessWidget {
  const ManualBarberScreen({super.key, required this.bloc});

  final ManualBarberBloc bloc;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.managerManualBarberTitle)),
      body: BlocBuilder<ManualBarberBloc, ManualBarberState>(
        bloc: bloc,
        builder: (context, state) {
          if (state.createdBarber != null) {
            return StatusView(
              icon: Icons.check_circle_outline,
              title: l10n.managerBarberCreated,
            );
          }
          return ManualBarberForm(bloc: bloc, state: state);
        },
      ),
    );
  }
}
