<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Stylists;

use Modules\Barber\Models\BarberModel;
use Modules\Dashboard\CQRS\Command\StoreStylistCommand;
use Modules\Dashboard\Eloquent\Resolvers\Stylists\StoreStylistEloquentResolver;
use Modules\Dashboard\Eloquent\Resolvers\Stylists\StylistChairAssignmentResolver;

final readonly class StoreStylistHandler
{
    public function __construct(
        private StylistChairAssignmentResolver $assignmentResolver,
        private StoreStylistEloquentResolver $resolver,
    ) {}

    public function handle(StoreStylistCommand $command): BarberModel
    {
        $this->assignmentResolver->ensureWithinBranch($command->attributes['chair_id'] ?? null, $command->branchId);

        return $this->resolver->resolve($command->attributes);
    }
}
