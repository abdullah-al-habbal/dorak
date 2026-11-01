<?php

declare(strict_types=1);

namespace Modules\Activation\CQRS\Command\Business;

use Modules\Activation\Enums\ActivableTypeEnum;

final readonly class ToggleActivationCommand
{
    public function __construct(
        public string $activableId,
        public ActivableTypeEnum $activableType,
        public bool $activate,
        public ?string $reason,
    ) {}
}
