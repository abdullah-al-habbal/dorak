<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Stylists;

use Modules\Barber\Models\BarberModel;

final class DestroyStylistEloquentResolver
{
    public function resolve(BarberModel $stylist): void
    {
        $stylist->delete();
    }
}
