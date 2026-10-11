import 'package:json_annotation/json_annotation.dart';

part 'saved_filter.dto.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)
class SavedFilterDto {
  const SavedFilterDto({
    required this.id,
    required this.name,
    required this.filterConfig,
  });
  final String id;
  final String name;
  final Map<String, dynamic> filterConfig;
  factory SavedFilterDto.fromJson(Map<String, dynamic> json) =>
      _$SavedFilterDtoFromJson(json);
}
