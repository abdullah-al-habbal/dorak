Referenced from [`../SKILL.md`](../SKILL.md).

## Write example: Create booking

### Command

```php
<?php
declare(strict_types=1);

namespace Modules\Booking\CQRS\Command;

final class CreateBookingCommand
{
    public function __construct(
        public readonly string $title,
        public readonly string $description,
    ) {}
}
```

### Request

```php
<?php
declare(strict_types=1);

namespace Modules\Booking\Http\Requests;

use Modules\Booking\CQRS\Command\CreateBookingCommand;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class CreateBookingRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
        ];
    }

    public function toCommand(): CreateBookingCommand
    {
        return new CreateBookingCommand(
            title: $this->validated('title'),
            description: $this->validated('description'),
        );
    }
}
```

The request builds the Command/Query object explicitly. The Action calls `$request->toCommand()`.

