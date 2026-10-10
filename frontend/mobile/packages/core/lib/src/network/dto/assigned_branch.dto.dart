class AssignedBranchDto {
  const AssignedBranchDto({required this.id, required this.name});

  final String id;
  final String name;

  factory AssignedBranchDto.fromJson(Map<String, Object?> json) =>
      AssignedBranchDto(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? '',
      );
}
