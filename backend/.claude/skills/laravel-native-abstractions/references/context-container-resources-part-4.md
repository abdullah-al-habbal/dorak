---
codeanchors:
  - backend/modules/
---

Part 4 of 4 · [Context, Container, Storage, API Resources](context-container-resources.md) · [Previous](context-container-resources-part-3.md)

## API Resources

Use `JsonResource` conditional APIs to describe the response contract rather than hand-built
array conditionals.

```php
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'status' => $this->status,
        'customer' => ClientResource::make($this->whenLoaded('client')),
        'items_count' => $this->whenCounted('items'),
        'items_total' => $this->whenAggregated('items', 'price', 'sum'),
        'internal_note' => $this->when($request->user()?->isStaff() === true, $this->internal_note),
        'meta' => $this->mergeWhen($this->hasMeta(), fn () => ['meta' => $this->meta]),
    ];
}
```

Verified in `Http/Resources/ConditionallyLoadsAttributes.php`: `when()`, `whenNotNull()`,
`mergeWhen()`, `whenLoaded()`, `whenCounted()`, `whenAggregated($relationship, $column,
$aggregate)`, `whenExistsLoaded()`, `whenPivotLoaded()`, `whenAppended()`, `whenHas()`.

- `whenLoaded()` omits the key when the relation is not loaded — it does **not** trigger a lazy
  load. This is the correct pairing with deliberate eager loading.
- Never return a bare model or `toArray()` from an endpoint. The Resource is the public
  contract; the model is internal shape.
- Response envelope, status codes, and error keys are owned by `api-response-standard`
  (`ApiResponseBodyValueObject` + `ApiResponseTrait`). Resources shape `data`, nothing else.
- Bilingual fields go through Spatie Translatable — see `translation-conventions`.
