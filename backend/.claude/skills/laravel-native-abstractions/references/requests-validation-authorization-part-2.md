---
codeanchors:
  - backend/modules/
---

Part 2 of 4 · [Requests, Validation, Routing, Authorization](requests-validation-authorization.md) · [Previous](requests-validation-authorization.md) · [Next](requests-validation-authorization-part-3.md)

## Form Requests and rule objects

Validate at the boundary. In this repo that is the Form Request feeding an Action, which then
builds a Command/Query object — see `cqrs-pattern` and `10StrictBackendArchitecture`. Do not
re-validate inside Handlers.

Use semantic rules instead of assembled strings:

```php
use Illuminate\Validation\Rule;

public function rules(): array
{
    return [
        'status' => ['required', Rule::enum(BookingStatusEnum::class)],
        'branch_id' => ['required', 'uuid', Rule::exists('branches', 'id')],
        'email' => ['required', 'email', Rule::unique('clients', 'email')->ignore($this->client)],
        'discount_code' => ['nullable', 'string', Rule::excludeIf(fn (): bool => ! $this->boolean('has_discount'))],
        'items' => ['required', 'array', 'min:1'],
        'items.*.quantity' => ['required', 'integer', 'min:1'],
    ];
}
```

Useful rule builders: `Rule::enum()` (with `->only()` / `->except()`), `Rule::exists()`,
`Rule::unique()`, `Rule::in()`, `Rule::requiredIf()`, `Rule::prohibitedIf()`,
`Rule::excludeIf()`, `Rule::when()`, `Rule::forEach()`, `Rule::array()`, `Rule::date()`,
`Rule::file()`, `Rule::imageFile()`, `Rule::anyOf()`.

Do **not**:

- Query the database to check existence when `Rule::exists()` says it.
- Check uniqueness manually and then assume the write is safe — the unique index is the
  authority (see `references/eloquent-persistence.md`).
- Build `'in:'.implode(',', array_column(Enum::cases(), 'value'))` — that is `Rule::enum()`.
- Pass `$request->all()` into a model, Command, or Handler. Use `validated()`, `safe()`, or a
  DTO.

For conditional logic that rules cannot express, use `withValidator()` /
`$validator->sometimes(...)`, and `prepareForValidation()` for normalization before rules run.

Error shape is owned by `api-response-standard` + `ErrorCodeEnum`; messages by
`translation-conventions`.

---
