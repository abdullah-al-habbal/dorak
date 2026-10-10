import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

import 'package:client_app/src/features/profile/saved_addresses.bloc.dart';

class SavedAddressesScreen extends StatefulWidget {
  const SavedAddressesScreen({super.key, required this.preferences});
  final AppPreferences preferences;
  @override
  State<SavedAddressesScreen> createState() => _SavedAddressesScreenState();
}

class _SavedAddressesScreenState extends State<SavedAddressesScreen> {
  late final SavedAddressesCubit _cubit;
  List<SavedAddress> get _addresses => _cubit.state.addresses;

  @override
  void initState() {
    super.initState();
    _cubit = SavedAddressesCubit(widget.preferences);
  }

  Future<void> _edit([SavedAddress? previous]) async {
    final l10n = AppLocalizations.of(context)!;
    final street = TextEditingController(text: previous?.street);
    final building = TextEditingController(text: previous?.building);
    final unit = TextEditingController(text: previous?.unit);
    final lat = TextEditingController(text: previous?.latitude.toString());
    final lng = TextEditingController(text: previous?.longitude.toString());
    final saved = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          previous == null
              ? l10n.savedAddressAddTitle
              : l10n.savedAddressEditTitle,
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: street,
                decoration: InputDecoration(
                  labelText: l10n.savedAddressStreetLabel,
                ),
              ),
              TextField(
                controller: building,
                decoration: InputDecoration(
                  labelText: l10n.savedAddressBuildingLabel,
                ),
              ),
              TextField(
                controller: unit,
                decoration: InputDecoration(
                  labelText: l10n.savedAddressUnitLabel,
                ),
              ),
              TextField(
                controller: lat,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: l10n.savedAddressLatitudeLabel,
                ),
              ),
              TextField(
                controller: lng,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: l10n.savedAddressLongitudeLabel,
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l10n.cancel),
          ),
          FilledButton(
            onPressed: () async {
              final address = SavedAddress(
                street: street.text.trim(),
                building: building.text.trim(),
                unit: unit.text.trim(),
                latitude: double.tryParse(lat.text) ?? 0,
                longitude: double.tryParse(lng.text) ?? 0,
              );
              await _cubit.save(address, previous: previous);
              if (context.mounted) Navigator.pop(context, true);
            },
            child: Text(l10n.profileSaveAction),
          ),
        ],
      ),
    );
    street.dispose();
    building.dispose();
    unit.dispose();
    lat.dispose();
    lng.dispose();
    if (saved == true && mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text(AppLocalizations.of(context)!.savedAddressesTitle),
    ),
    floatingActionButton: FloatingActionButton(
      onPressed: _edit,
      child: const Icon(Icons.add),
    ),
    body: ListView(
      children: _addresses
          .map(
            (address) => ListTile(
              title: Text(address.label),
              subtitle: Text('${address.latitude}, ${address.longitude}'),
              onTap: () => _edit(address),
              trailing: IconButton(
                icon: const Icon(Icons.delete_outline),
                onPressed: () async {
                  await _cubit.delete(address);
                  if (mounted) setState(() {});
                },
              ),
            ),
          )
          .toList(),
    ),
  );

  @override
  void dispose() {
    _cubit.close();
    super.dispose();
  }
}
