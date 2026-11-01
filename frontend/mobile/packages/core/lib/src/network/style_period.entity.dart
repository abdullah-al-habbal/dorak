import 'package:json_annotation/json_annotation.dart';

/// Mirrors the backend `Modules\ServiceCatalog\Enums\StylePeriodEnum` PHP enum.
@JsonEnum()
enum StylePeriod {
  @JsonValue('classic')
  classic,
  @JsonValue('modern')
  modern;

  /// Returns null for values this app version does not know.
  static StylePeriod? tryParse(String? value) => switch (value) {
    'classic' => StylePeriod.classic,
    'modern' => StylePeriod.modern,
    _ => null,
  };

  String get value => switch (this) {
    StylePeriod.classic => 'classic',
    StylePeriod.modern => 'modern',
  };
}
