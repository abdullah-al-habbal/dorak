---
nodeid: skills.backend.laravel-attributes.references.routing-form-resource-factory-testing.part-2
parentnode: skills.backend.laravel-attributes.references.routing-form-resource-factory-testing
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 2 · [routing form resource factory testing](routing-form-resource-factory-testing.md) · [Previous](routing-form-resource-factory-testing.md)

## Testing attributes

Import from `Illuminate\Foundation\Testing\Attributes`.

| Attribute | Replaces |
|---|---|
| `#[Seed]` (marker) | `protected $seed = true` |
| `#[Seeder(RoleAndPermissionSeeder::class)]` | `protected $seeder` |
| `#[SetUp]` on a method | `protected function setUp()` |
| `#[TearDown]` on a method | `protected function tearDown()` |

```php
use Illuminate\Foundation\Testing\Attributes\SetUp;

class OrderTest extends TestCase
{
    private User $user;

    #[SetUp]
    public function createUser(): void
    {
        $this->user = User::factory()->create();
    }
}
```
