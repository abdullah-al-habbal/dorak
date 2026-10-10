<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Profile;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Eloquent\Resolvers\Profile\DashboardEmailChangeEloquentResolver;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Dashboard\Support\DashboardProfileData;

final class GetProfileAction extends BaseApiAction
{
    public function __construct(private readonly DashboardEmailChangeEloquentResolver $emailChanges) {}

    public function __invoke(Request $request): JsonResponse
    {
        /** @var AdminModel|BranchModel|BarberModel $model */
        $model = $request->attributes->get('dashboard_model');
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $pending = $this->emailChanges->find($actor);

        return $this->ok(DashboardProfileData::fromModel($model, $pending?->email)->toArray());
    }
}
