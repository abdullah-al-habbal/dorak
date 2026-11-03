<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Barbers;

use Modules\Dashboard\CQRS\Command\UpsertBarberServiceOverrideCommand;
use Modules\Dashboard\Eloquent\Resolvers\Barbers\UpsertBarberServiceOverrideEloquentResolver;
use Modules\OfferedService\Models\OfferedServiceModel;

final readonly class UpsertBarberServiceOverrideHandler
{
    public function __construct(private UpsertBarberServiceOverrideEloquentResolver $resolver) {}

    public function handle(UpsertBarberServiceOverrideCommand $command): OfferedServiceModel
    {
        return $this->resolver->resolve($command);
    }
}
