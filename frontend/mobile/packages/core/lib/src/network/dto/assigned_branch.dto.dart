import 'package:json_annotation/json_annotation.dart';

part 'assigned_branch.dto.g.dart';

@JsonSerializable(createToJson: false)
class AssignedBranchDto {
  final String id;
  final String name;

  const AssignedBranchDto({required this.id, required this.name});

  factory AssignedBranchDto.fromJson(Map<String, dynamic> json) =>
      _$AssignedBranchDtoFromJson(json);
}
