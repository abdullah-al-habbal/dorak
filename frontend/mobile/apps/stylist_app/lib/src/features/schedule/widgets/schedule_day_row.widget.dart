import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:localization/localization.dart';

class ScheduleDayRow extends StatelessWidget {
  const ScheduleDayRow({
    super.key,
    required this.day,
    required this.dayName,
    required this.onActiveChanged,
    required this.onStartChanged,
    required this.onEndChanged,
  });

  final BarberScheduleDayDto day;
  final String dayName;
  final ValueChanged<bool> onActiveChanged;
  final ValueChanged<String> onStartChanged;
  final ValueChanged<String> onEndChanged;

  Future<void> _pick(
    BuildContext context,
    String current,
    ValueChanged<String> onPicked,
  ) async {
    final parts = current.split(':');
    final picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(
        hour: int.parse(parts[0]),
        minute: int.parse(parts[1]),
      ),
    );
    if (picked == null) return;
    onPicked(
      '${picked.hour.toString().padLeft(2, '0')}:'
      '${picked.minute.toString().padLeft(2, '0')}',
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      children: [
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(dayName),
          value: day.isActive,
          onChanged: onActiveChanged,
        ),
        if (day.isActive)
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () =>
                      _pick(context, day.startTime, onStartChanged),
                  child: Text('${l10n.stylistScheduleStart} ${day.startTime}'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton(
                  onPressed: () => _pick(context, day.endTime, onEndChanged),
                  child: Text('${l10n.stylistScheduleEnd} ${day.endTime}'),
                ),
              ),
            ],
          ),
      ],
    );
  }
}
