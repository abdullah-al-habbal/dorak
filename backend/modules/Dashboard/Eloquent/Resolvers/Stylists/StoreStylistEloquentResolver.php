<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Stylists;

use Illuminate\Support\Facades\DB;
use Modules\Barber\Models\BarberModel;
use Modules\Chair\Models\ChairModel;

final class StoreStylistEloquentResolver
{
    /** @param array<string, mixed> $attributes */
    public function resolve(array $attributes): BarberModel
    {
        return DB::transaction(function () use ($attributes): BarberModel {
            $chairId = $attributes['chair_id'] ?? null;
            unset($attributes['chair_id']);
            $stylist = BarberModel::query()->create([
                ...$attributes,
                'has_login' => true,
                'managed_by_branch_id' => $attributes['managed_by_branch_id'],
            ]);

            if ($chairId !== null) {
                ChairModel::query()->whereKey($chairId)->update(['barber_id' => $stylist->id]);
            }

            return $stylist;
        });
    }
}
