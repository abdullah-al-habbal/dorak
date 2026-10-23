# Flutter: json_serializable & JsonEnum

Referenced from [`../SKILL.md`](../SKILL.md) §6–8.

## 6. Flutter: `json_serializable` (`dorak_client_app`)

### 6.1 Every DTO/Entity MUST use `@JsonSerializable`

```dart
import 'package:json_annotation/json_annotation.dart';
part 'my_dto.g.dart';

@JsonSerializable()
final class MyDto {
  @JsonKey(name: 'backend_snake_case')
  final String id;

  const MyDto({required this.id});

  factory MyDto.fromJson(Map<String, dynamic> json) => _$MyDtoFromJson(json);
  Map<String, dynamic> toJson() => _$MyDtoToJson(this);
}
```

### 6.2 Every property MUST have explicit `@JsonKey(name: '...')`

Maps backend `snake_case` to frontend `camelCase`. No implicit naming.

### 6.3 Enum fields use `unknownEnumValue` for safe fallback

```dart
@JsonKey(name: 'status', unknownEnumValue: ChairStatus.available)
final ChairStatus status;
```

### 6.4 Generate code with build_runner

```bash
dart run build_runner build --delete-conflicting-outputs
```

## 7. Flutter: `@JsonEnum`

Every Dart enum that maps to a backend string MUST have `@JsonEnum()`:

```dart
import 'package:json_annotation/json_annotation.dart';

@JsonEnum()
enum ChairStatus {
  available,
  occupied,
  maintenance;
}
```

## 8. ZERO manual parsing

- NO manual `as Type` casting in DTOs
- NO manual `fromJson` switch/if-else logic
- NO `Map<String, dynamic>` in Domain Entities (use `Map<String, String>` for translatable fields)
- NO duplicate Entity files — single source of truth per concept
