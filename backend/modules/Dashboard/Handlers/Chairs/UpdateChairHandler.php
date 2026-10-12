<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Chairs;

use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Models\ChairModel;
use Modules\Dashboard\CQRS\Command\UpdateChairCommand;
use Modules\Dashboard\Eloquent\Resolvers\Chairs\ChairBarberAssignmentResolver;
use Modules\Dashboard\Eloquent\Resolvers\Chairs\ChairConflictResolver;
use Modules\Dashboard\Eloquent\Resolvers\Chairs\UpdateChairEloquentResolver;

final readonly class UpdateChairHandler
{
    public function __construct(
        private ChairBarberAssignmentResolver $barberAssignmentResolver,
        private ChairConflictResolver $conflictResolver,
        private UpdateChairEloquentResolver $resolver,
    ) {}

    public function handle(ChairModel $chair, UpdateChairCommand $command): ?ChairModel
    {
        $attributes = $command->attributes;
        if (! $this->barberAssignmentResolver->ensureWithinBranch($attributes['barber_id'] ?? null, $command->branchId)) {
            return null;
        }

        $deactivating = array_key_exists('status', $attributes)
            && $attributes['status'] !== ChairStatus::Available->value;
        $reassigningBarber = array_key_exists('barber_id', $attributes)
            && $attributes['barber_id'] !== $chair->barber_id;

        if ($deactivating || $reassigningBarber) {
            $this->conflictResolver->ensureNoBlockingBookings($chair->id);
        }

        return $this->resolver->resolve($chair, $attributes);
    }
}
