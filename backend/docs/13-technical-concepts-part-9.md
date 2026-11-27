---
nodeid: backend.13-technical-concepts.part-9
parentnode: backend.13-technical-concepts.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 9 of 19 · [13 — Technical Concepts: Mandatory Reference](13-technical-concepts.md) · [Previous](13-technical-concepts-part-8.md) · [Next](13-technical-concepts-part-10.md)

### Concept 09: Read Consistency Models

**Rule:** Large apps copy data across multiple servers. Consistency defines how quickly a write becomes visible everywhere.

| Model | Behavior | Trade-off | Best For |
|-------|----------|-----------|----------|
| **Strict Consistency** | Every read is guaranteed up to date | Writes are slower | Payments, balances, booking confirmations |
| **Eventual Consistency** | Brief delay before all servers catch up | Speed over instant correctness | Social feeds, view counts, chair status |

**Dorak Context:**

| Feature | Consistency Model | Why |
|---------|------------------|-----|
| Booking creation | **Strict** | Double-booking prevention requires immediate consistency |
| Chair status toggle | **Eventual** (Reverb broadcast) | Brief delay acceptable, speed matters for UX |
| Barber profile update | **Eventual** | Profile changes can propagate slightly delayed |
| Payment/billing | **Strict** | Financial accuracy required |

---

### Concept 10: Field Projection

**Rule:** When listing resources, allow the client to request only the fields it needs — reducing payload size and improving performance.

**Implementation:**

```
GET /api/v1/explore/branches?fields=id,name,rating,latitude,longitude
```

**Laravel Implementation:**

```php
// Using Laravel API Resources
final class BranchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $fields = $request->input('fields');
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'rating' => $this->rating,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            // ... all fields
        ];

        if ($fields) {
            return array_intersect_key($data, array_flip(explode(',', $fields)));
        }
        return $data;
    }
}
```

**Flutter Implementation:**
