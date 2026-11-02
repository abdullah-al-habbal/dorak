---
nodeid: skills.backend.laravel-attributes.references.queue-and-console-attributes
parentnode: skills.backend.laravel-attributes
childnodes: []
codeanchors:
  - backend/modules/
---

Referenced from [`../SKILL.md`](../SKILL.md).

## Queue / job attributes

Import from `Illuminate\Queue\Attributes\`. Combine freely.

| Attribute | Replaces |
|---|---|
| `#[Tries(3)]` | `public $tries` |
| `#[Timeout(120)]` | `public $timeout` |
| `#[Backoff(30)]` or `#[Backoff([10, 30, 60])]` | `public $backoff` (fixed or exponential) |
| `#[MaxExceptions(3)]` | `public $maxExceptions` |
| `#[Queue('high')]` | `public $queue` |
| `#[Connection('redis')]` | `public $connection` |
| `#[UniqueFor(3600)]` | `public $uniqueFor` (needs `ShouldBeUnique`) |
| `#[FailOnTimeout]` (marker) | `public $failOnTimeout = true` |

```php
use Illuminate\Queue\Attributes\{Backoff, Connection, Queue, Timeout, Tries};

#[Connection('redis')]
#[Queue('high')]
#[Tries(3)]
#[Timeout(60)]
#[Backoff([5, 15, 30])]
class ProcessPayment implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
}
```

## Console command attributes

Import from `Illuminate\Console\Attributes\`. Replace `$signature`, `$description`, `$help`.

| Attribute | Replaces |
|---|---|
| `#[Signature('users:prune {--days=30 : Days of inactivity}')]` | `protected $signature` |
| `#[Signature('cache:warm', aliases: ['warm-cache'])]` | `$signature` + `$aliases` |
| `#[Description('...')]` | `protected $description` |
| `#[Help('...')]` | `protected $help` |
| `#[Hidden]` (marker) | `protected $hidden = true` |
| `#[Usage('users:prune --days=60')]` (repeatable) | help-text usage lines |

```php
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;

#[Signature('users:prune {--days=30 : Days of inactivity}')]
#[Description('Prune inactive user accounts')]
class PruneUsers extends Command
{
    public function handle(): void {}
}
```

Multiline signatures: preserve newlines and indentation of `{--...}` continuation lines byte-for-byte inside the attribute string.
