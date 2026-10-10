<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Profile;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Modules\Dashboard\CQRS\Command\RequestDashboardEmailChangeCommand;
use Modules\Dashboard\Eloquent\Resolvers\Profile\DashboardEmailChangeEloquentResolver;
use Modules\Dashboard\Models\DashboardEmailChangeModel;
use Modules\Dashboard\Support\DashboardActor;

final class RequestDashboardEmailChangeHandler
{
    public function __construct(private readonly DashboardEmailChangeEloquentResolver $resolver) {}

    /** @return array{change: DashboardEmailChangeModel, code: string}|null */
    public function handle(DashboardActor $actor, RequestDashboardEmailChangeCommand $command): ?array
    {
        if ($this->resolver->existsForAnotherActor($command->email, $actor)) {
            return null;
        }

        $code = (string) random_int(100000, 999999);
        $change = DB::transaction(fn (): DashboardEmailChangeModel => $this->resolver->upsert($actor, $command->email, Hash::make($code)));

        return ['change' => $change, 'code' => $code];
    }
}
