Referenced from [`../CLAUDE.md`](../CLAUDE.md).

## 4b. Code Generation Policy (mandatory)

**All new and existing `*.dto.dart` models MUST use `build_runner` +
`json_serializable` codegen — hand-written `fromJson` is forbidden.**

1. Every DTO declares `part '<file>.g.dart';` and an
   `@JsonSerializable` annotation. `fromJson` is generated; generated files
   are committed alongside the DTO.
2. `fieldRename: FieldRename.snake` maps backend snake_case automatically;
   `@JsonKey(name: ..., defaultValue: ...)` for key overrides and defaults.
3. Response DTOs use `createToJson: false` (requests use plain maps);
   generic DTOs (`ApiResponse<T>`, `PaginatedData<T>`) use
   `genericArgumentFactories: true`.
4. After editing a DTO, regenerate:
   `melos run build` (runs build_runner only in packages that declare
   `json_serializable`). Run `melos run verify` before finishing.
5. Generated files (`*.g.dart`, `*.freezed.dart`) are excluded from the
   analyzer (`analysis_options.yaml`), the taxonomy checker
   (`tool/check_taxonomy.dart`), and AI indexing (`.aiignore`).
6. Exception: plain value objects with no JSON serialization
   (e.g. `discovery_card.entity.dart`) may stay hand-written; they are not
   DTOs. Anything that touches a wire format must use codegen.

