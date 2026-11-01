<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Bookings;

use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Dashboard\CQRS\Command\CreateWalkInBookingCommand;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

final class WalkInBookingScopeResolver
{
    public function ensureResourcesBelongToBranch(CreateWalkInBookingCommand $command): void
    {
        $branch = BranchModel::query()->findOrFail($command->branchId);
        $chair = ChairModel::query()->whereBelongsTo($branch, 'branch')->findOrFail($command->chairId);

        if ($command->barberId !== null && $chair->barber_id !== $command->barberId) {
            throw new WalkInStylistNotAssignedException;
        }

        $serviceCount = OfferedServiceModel::query()
            ->whereIn('id', $command->serviceIds)
            ->where('serviceable_type', ServiceableTypeEnum::Brand)
            ->where('serviceable_id', $branch->getAttribute('brand_id'))
            ->count();

        if ($serviceCount !== count($command->serviceIds)) {
            throw new WalkInServicesUnavailableException;
        }
    }
}
