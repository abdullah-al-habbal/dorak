<?php

declare(strict_types=1);

namespace Modules\Barber\Repositories;

use Modules\Barber\CQRS\Command\Barber\RegisterCommand;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;

final class RegisterEloquentResolver
{
    public function resolve(RegisterCommand $command): BarberModel
    {
        return BarberModel::query()->create([
            'name' => $command->name,
            'email' => $command->email,
            'password' => $command->password,
            'phone' => $command->phone,
            'has_login' => true,
            'is_freelancer' => $command->isFreelancer,
            'status' => BarberStatusEnum::Pending,
        ]);
    }
}
