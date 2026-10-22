<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Profile;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\CQRS\Command\VerifyDashboardEmailChangeCommand;
use Modules\Dashboard\Eloquent\Resolvers\Profile\DashboardEmailChangeEloquentResolver;
use Modules\Dashboard\Support\DashboardActor;

final class VerifyDashboardEmailChangeHandler
{
    private const int MAX_ATTEMPTS = 5;

    public function __construct(private readonly DashboardEmailChangeEloquentResolver $resolver) {}

    public function handle(AdminModel|BranchModel|BarberModel|ClientModel $model, DashboardActor $actor, VerifyDashboardEmailChangeCommand $command): bool
    {
        return DB::transaction(function () use ($model, $actor, $command): bool {
            $change = $this->resolver->find($actor);
            if ($change === null || $change->expires_at->isPast() || $change->attempts >= self::MAX_ATTEMPTS) {
                return false;
            }

            if (! Hash::check($command->code, $change->code_hash)) {
                $change->increment('attempts');

                return false;
            }

            if ($this->resolver->existsForAnotherActor($change->email, $actor)) {
                return false;
            }

            $this->resolver->apply($model, $change);

            return true;
        });
    }
}
