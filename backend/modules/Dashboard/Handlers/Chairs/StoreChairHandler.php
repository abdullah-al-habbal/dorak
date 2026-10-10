<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Chairs;

use Modules\Chair\Models\ChairModel;
use Modules\Dashboard\CQRS\Command\StoreChairCommand;
use Modules\Dashboard\Eloquent\Resolvers\Chairs\ChairBarberAssignmentResolver;
use Modules\Dashboard\Eloquent\Resolvers\Chairs\StoreChairEloquentResolver;

final readonly class StoreChairHandler
{
    public function __construct(
        private ChairBarberAssignmentResolver $barberAssignmentResolver,
        private StoreChairEloquentResolver $resolver,
    ) {}

    public function handle(StoreChairCommand $command): ?ChairModel
    {
        if (! $this->barberAssignmentResolver->ensureWithinBranch($command->attributes['barber_id'] ?? null, $command->branchId)) {
            return null;
        }

        return $this->resolver->resolve($command->attributes);
    }
}
