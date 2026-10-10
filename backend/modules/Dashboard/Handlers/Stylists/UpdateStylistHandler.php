<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Stylists;

use Modules\Barber\Models\BarberModel;
use Modules\Dashboard\CQRS\Command\UpdateStylistCommand;
use Modules\Dashboard\Eloquent\Resolvers\Stylists\StylistChairAssignmentResolver;
use Modules\Dashboard\Eloquent\Resolvers\Stylists\UpdateStylistEloquentResolver;

final readonly class UpdateStylistHandler
{
    public function __construct(
        private StylistChairAssignmentResolver $assignmentResolver,
        private UpdateStylistEloquentResolver $resolver,
    ) {}

    public function handle(BarberModel $stylist, UpdateStylistCommand $command): BarberModel
    {
        $this->assignmentResolver->ensureWithinBranch($command->attributes['chair_id'] ?? null, $command->branchId);

        return $this->resolver->resolve($stylist, $command->attributes);
    }
}
