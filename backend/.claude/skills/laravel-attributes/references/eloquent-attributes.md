---
codeanchors:
  - backend/modules/
---

Referenced from [`../SKILL.md`](../SKILL.md).

## Eloquent model attributes

Replace model properties. Import from `Illuminate\Database\Eloquent\Attributes\`.

| Attribute | Replaces |
|---|---|
| `#[Fillable([...])]` | `protected $fillable` |
| `#[Guarded([...])]` | `protected $guarded` |
| `#[Unguarded]` (marker) | `protected $guarded = []` |
| `#[Hidden([...])]` | `protected $hidden` |
| `#[Visible([...])]` | `protected $visible` |
| `#[Appends([...])]` | `protected $appends` |
| `#[Table(...)]` | `$table`, `$primaryKey`, `$keyType`, `$incrementing`, `$timestamps`, `$dateFormat` |
| `#[Connection('name')]` | `protected $connection` |
| `#[Touches([...])]` | `protected $touches` |

```php
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Table;

#[Fillable(['title', 'body', 'status'])]
#[Hidden(['password', 'remember_token'])]
#[Table('blog_posts')]
class Post extends Model {}
```

`#[Table]` with all options (named args):

```php
#[Table(
    name: 'external_orders',
    key: 'uuid',
    keyType: 'string',
    incrementing: false,
    timestamps: false,
)]
class ExternalOrder extends Model {}
```
