---
codeanchors:
  - backend/modules/
---

Referenced from [`../SKILL.md`](../SKILL.md).

## Routing / controller attributes

Import from `Illuminate\Routing\Attributes\Controllers`. N/A in this repo (controllers banned) — listed for completeness.

| Attribute | Replaces |
|---|---|
| `#[Middleware('auth')]` (repeatable, `only:`/`except:`) | constructor `$this->middleware(...)` |
| `#[Authorize('update', Post::class)]` (`only:`/`except:`) | `authorizeResource()` / constructor gates |

```php
use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth')]
#[Middleware('throttle:60,1', except: ['index', 'show'])]
class PostController extends Controller {}
```

## Form request attributes

Import from `Illuminate\Foundation\Http\Attributes`.

| Attribute | Replaces |
|---|---|
| `#[ErrorBag('createPost')]` | `protected $errorBag` |
| `#[RedirectTo('/posts/create')]` | `protected $redirect` |
| `#[RedirectToRoute('posts.create')]` | `protected $redirectRoute` |
| `#[StopOnFirstFailure]` (marker) | `protected $stopOnFirstFailure = true` |

## HTTP resource attributes

Import from `Illuminate\Http\Resources\Attributes`.

| Attribute | Replaces |
|---|---|
| `#[Collects(PostResource::class)]` | `public $collects` |
| `#[PreserveKeys]` (marker) | `public $preserveKeys = true` |

## Factory attributes

| Attribute | Replaces |
|---|---|
| `#[UseModel(Post::class)]` from `Illuminate\Database\Eloquent\Factories\Attributes\UseModel` | `protected $model` |

## Continued in

- [Part 2: Testing attributes](routing-form-resource-factory-testing-part-2.md)
