<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use LogicException;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\TokenAbility;
use Modules\Core\Helpers\ApiResponseTrait;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Repositories\DashboardOwnerActorResolver;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Dashboard\Support\DashboardSessionClaim;
use Symfony\Component\HttpFoundation\Response;

final class DashboardAuthorizationMiddleware
{
    use ApiResponseTrait;

    public function __construct(
        private readonly DashboardSessionClaim $claim,
        private readonly DashboardOwnerActorResolver $ownerActors,
    ) {}

    /** @param Closure(Request): Response $next */
    public function handle(Request $request, Closure $next): Response
    {
        $sessionClaim = $request->header('X-Dashboard-Session');
        if (is_string($sessionClaim) && ! $this->claim->isValid($sessionClaim)) {
            return $this->unauthorized();
        }

        foreach ($this->guards() as $guard) {
            $model = $request->user($guard);
            if (! $model instanceof AdminModel && ! $model instanceof BranchModel && ! $model instanceof BarberModel && ! $model instanceof ClientModel) {
                continue;
            }

            if ($model instanceof AdminModel && ! $model->isActive()) {
                continue;
            }

            $token = $model->currentAccessToken();
            if (! $model->tokenCan(TokenAbility::Dashboard->value)) {
                continue;
            }

            $actor = $this->actorFor($guard, $model);
            if ($actor === null) {
                continue;
            }

            $request->attributes->set('dashboard_actor', $actor);
            $request->attributes->set('dashboard_guard', $guard);
            $request->attributes->set('dashboard_model', $model);
            $request->attributes->set('dashboard_token', $token);

            return $next($request);
        }

        return $this->unauthorized();
    }

    /** @return list<string> */
    private function guards(): array
    {
        return ['admin_api', 'branch_api', 'barber', 'client'];
    }

    private function actorFor(string $guard, AdminModel|BranchModel|BarberModel|ClientModel $model): ?DashboardActor
    {
        if ($guard === 'admin_api' && $model instanceof AdminModel) {
            return new DashboardActor($this->idFor($model), DashboardActorTypeEnum::Admin, 'platform_admin', null);
        }
        if ($guard === 'branch_api' && $model instanceof BranchModel) {
            return $this->branchActor($model);
        }
        if ($guard === 'barber' && $model instanceof BarberModel) {
            return new DashboardActor($this->idFor($model), DashboardActorTypeEnum::Barber, 'barber', null);
        }
        if ($guard === 'client' && $model instanceof ClientModel) {
            return $this->ownerActors->forClient($model);
        }

        throw new LogicException(__('dashboard::messages.guard_unsupported'));
    }

    private function branchActor(BranchModel $model): DashboardActor
    {
        $brandId = $model->getAttribute('brand_id');
        $brandId = is_string($brandId) || is_int($brandId) ? (string) $brandId : null;

        $id = $this->idFor($model);

        return new DashboardActor($id, DashboardActorTypeEnum::Branch, 'branch_manager', $id, $brandId);
    }

    private function idFor(AdminModel|BranchModel|BarberModel $model): string
    {
        $id = $model->getKey();
        if (! is_string($id) && ! is_int($id)) {
            throw new LogicException(__('dashboard::messages.guard_unsupported'));
        }

        return (string) $id;
    }
}
