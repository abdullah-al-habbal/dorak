<?php

declare(strict_types=1);

namespace Modules\Barber\Eloquent\Resolvers\Branch;

use Modules\Barber\CQRS\Command\Branch\CreateManagedBarberCommand;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;

final class CreateManagedBarberEloquentResolver
{
    public function resolve(CreateManagedBarberCommand $command): BarberModel
    {
        $branch = BranchModel::query()->findOrFail($command->branchId);
        $barber = BarberModel::query()->create([
            'name' => $command->name,
            'phone' => $command->phone,
            'has_login' => false,
            'status' => BarberStatusEnum::Pending,
        ]);

        if ($command->chairId !== null) {
            $chair = $branch->chairs()->whereKey($command->chairId)->firstOrFail();
            $chair->update(['barber_id' => $barber->getKey()]);
        }

        return $barber;
    }
}
