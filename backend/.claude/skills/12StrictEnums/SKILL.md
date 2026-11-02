---
name: strict-enums
description: Enforce PHP 8.1+ Backed Enums across the Dorak backend AND `json_serializable` + `@JsonKey` across the Flutter frontend. Use whenever creating a new status/type field, writing validation, casting model attributes, or defining Dart DTOs/Entities. All status/type DB columns must use Backed Enums, `Rule::enum` validation, and model casts. All Flutter DTOs/Entities must use `@JsonSerializable`, `@JsonKey`, and `@JsonEnum`.
nodeid: skills.backend.12-strict-enums
parentnode: skills.backend
childnodes:
  - skills.backend.12-strict-enums.references.flutter-json-serialization
  - skills.backend.12-strict-enums.part-2
codeanchors:
  - backend/modules/
---

# Strict Enums & JSON Serialization

## 1. Enum Creation

- Every status/type DB column gets a Backed Enum in `modules/{Module}/Enums/`
- Enum must be `string` backed with lowercase values matching DB
- Include `label(): string` and any domain helpers (e.g. `isBookable()`)

```php
enum ChairStatus: string
{
    case Available = 'available';
    case Occupied = 'occupied';
    case Maintenance = 'maintenance';

    public function label(): string
    {
        return __('chair::enums.status.'.$this->value);
    }

    public function isBookable(): bool
    {
        return $this === self::Available;
    }
}
```

## 2. Model Casts

Every `status`/`type` fillable column MUST have a `casts()` entry:

```php
protected function casts(): array
{
    return [
        'status' => ChairStatus::class,
    ];
}
```

## 3. Validation Rules

Use `Rule::enum` instead of `in:` strings:

```php
use Illuminate\Validation\Rules\Enum;

'status' => ['required', 'string', new Enum(ChairStatus::class)],
```

## Continued in

- [Part 2: 4. Comparisons](references/skill-part-2.md)
