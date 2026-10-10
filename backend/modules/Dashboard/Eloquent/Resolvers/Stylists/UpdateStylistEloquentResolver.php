<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Stylists;

use Illuminate\Support\Facades\DB;
use Modules\Barber\Models\BarberModel;
use Modules\Chair\Models\ChairModel;

final class UpdateStylistEloquentResolver
{
    /** @param array<string, mixed> $attributes */
    public function resolve(BarberModel $stylist, array $attributes): BarberModel
    {
        return DB::transaction(function () use ($stylist, $attributes): BarberModel {
            $chairId = $attributes['chair_id'] ?? null;
            unset($attributes['chair_id']);
            $stylist->update($attributes);

            if ($chairId !== null) {
                ChairModel::query()->whereKey($chairId)->update(['barber_id' => $stylist->id]);
            }

            return $stylist->refresh();
        });
    }
}
