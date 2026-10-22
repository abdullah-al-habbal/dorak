<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Chairs;

use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Models\ChairModel;
use Modules\Chair\Services\ChairStatusService;
use Modules\Chair\ValuesObjects\ChairStatusChangeResult;
use Modules\Dashboard\CQRS\Command\UpdateChairCommand;
use Modules\Dashboard\Eloquent\Resolvers\Chairs\ChairBarberAssignmentResolver;
use Modules\Dashboard\Eloquent\Resolvers\Chairs\ChairConflictResolver;

final readonly class UpdateChairHandler
{
    public function __construct(
        private ChairBarberAssignmentResolver $barberAssignmentResolver,
        private ChairConflictResolver $conflictResolver,
        private ChairStatusService $chairStatus,
    ) {}

    public function handle(ChairModel $chair, UpdateChairCommand $command): ?ChairStatusChangeResult
    {
        $attributes = $command->attributes;
        if (! $this->barberAssignmentResolver->ensureWithinBranch($attributes['barber_id'] ?? null, $command->branchId)) {
            return null;
        }

        $deactivating = array_key_exists('status', $attributes)
            && $attributes['status'] !== ChairStatus::Available->value;
        $maintenance = ($attributes['status'] ?? null) === ChairStatus::Maintenance->value;
        $reassigningBarber = array_key_exists('barber_id', $attributes)
            && $attributes['barber_id'] !== $chair->barber_id;

        if (($deactivating && ! $maintenance) || $reassigningBarber) {
            $this->conflictResolver->ensureNoBlockingBookings($chair->id);
        }

        return $this->chairStatus->update($chair, $attributes, $command->force);
    }
}
