<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Profile;

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\Models\DashboardEmailChangeModel;
use Modules\Dashboard\Support\DashboardActor;

final class DashboardEmailChangeEloquentResolver
{
    public function existsForAnotherActor(string $email, DashboardActor $actor): bool
    {
        return AdminModel::query()->where('email', $email)->whereKeyNot($actor->id)->exists()
            || BranchModel::query()->where('email', $email)->whereKeyNot($actor->id)->exists()
            || BarberModel::query()->where('email', $email)->whereKeyNot($actor->id)->exists()
            || ($actor->isBrandOwner() && ClientModel::withTrashed()->where('email', $email)->whereKeyNot($actor->id)->exists());
    }

    public function upsert(DashboardActor $actor, string $email, string $codeHash): DashboardEmailChangeModel
    {
        return DashboardEmailChangeModel::query()->updateOrCreate(
            ['actor_type' => $actor->actorType, 'actor_id' => $actor->id],
            ['email' => $email, 'code_hash' => $codeHash, 'attempts' => 0, 'expires_at' => now()->addMinutes(10)],
        );
    }

    public function find(DashboardActor $actor): ?DashboardEmailChangeModel
    {
        return DashboardEmailChangeModel::query()
            ->where('actor_type', $actor->actorType)
            ->where('actor_id', $actor->id)
            ->first();
    }

    public function apply(AdminModel|BranchModel|BarberModel|ClientModel $model, DashboardEmailChangeModel $change): void
    {
        $model->forceFill(['email' => $change->email, 'email_verified_at' => now()])->save();
        $change->delete();
    }
}
