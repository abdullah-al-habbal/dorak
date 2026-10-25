<?php

declare(strict_types=1);

namespace Modules\Activation\CQRS\Command\Business;

final readonly class ToggleActivationCommand
{
    public function __construct(
        public string $activableId,
        public string $activableType,
        public bool $activate,
        public ?string $reason,
    ) {}
}
