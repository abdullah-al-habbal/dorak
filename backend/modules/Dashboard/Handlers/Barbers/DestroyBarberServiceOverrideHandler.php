<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Barbers;

use Modules\Dashboard\CQRS\Command\DestroyBarberServiceOverrideCommand;
use Modules\Dashboard\Eloquent\Resolvers\Barbers\DestroyBarberServiceOverrideEloquentResolver;

final readonly class DestroyBarberServiceOverrideHandler
{
    public function __construct(private DestroyBarberServiceOverrideEloquentResolver $resolver) {}

    public function handle(DestroyBarberServiceOverrideCommand $command): void
    {
        $this->resolver->resolve($command);
    }
}
