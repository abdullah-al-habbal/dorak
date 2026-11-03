<?php

declare(strict_types=1);

namespace Modules\Barber\Handlers\Barber;

use Modules\Barber\Models\BarberModel;

final class LogoutHandler
{
    public function handle(BarberModel $barber): void
    {
        $barber->currentAccessToken()->delete();
    }
}
