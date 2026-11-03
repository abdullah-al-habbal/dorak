<?php

declare(strict_types=1);

namespace Modules\Barber\Repositories;

use Modules\Barber\Models\BarberModel;

final class LoginEloquentResolver
{
    public function findByEmail(string $email): ?BarberModel
    {
        return BarberModel::where('email', $email)->first();
    }

    /**
     * Only barbers with their own login can reset a password; managed barbers
     * created by a branch have none.
     */
    public function findResettableByEmail(string $email): ?BarberModel
    {
        return BarberModel::where('email', $email)
            ->where('has_login', true)
            ->whereNotNull('password')
            ->first();
    }
}
