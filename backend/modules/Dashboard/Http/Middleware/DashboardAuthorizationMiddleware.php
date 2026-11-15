<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use LogicException;
use Modules\Admin\Models\AdminModel;
use Modules\Ban\Http\Responses\AccountBannedResponse;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\TokenAbility;
use Modules\Core\Helpers\ApiResponseTrait;
use Modules\Dashboard\Constants\DashboardSessionConstants;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Repositories\DashboardOwnerActorResolver;
use Modules\Dashboard\Services\DashboardActorLiveness;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Dashboard\Support\DashboardSessionClaim;
use Symfony\Component\HttpFoundation\Response;

final class DashboardAuthorizationMiddleware
{
    use ApiResponseTrait;

    public function __construct(
        private readonly DashboardSessionClaim $claim,
        private readonly DashboardOwnerActorResolver $ownerActors,
        private readonly DashboardActorLiveness $liveness,
    ) {}

    /** @param Closure(Request): Response $next */
    public function handle(Request $request, Closure $next): Response
    {
        // D-01: the claim is mandatory. A missing, empty, malformed, expired, revoked or legacy (no `tid`) claim is a 401.
        $sessionClaim = $request->header(DashboardSessionConstants::DASHBOARD_SESSION_CLAIM_HEADER);
        if (! is_string($sessionClaim) || $sessionClaim === '' || ! $this->claim->isValid($sessionClaim)) {
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

            // F-01b and F-01c: a manager is ban-checked like clients and barbers (403), and a barber that is no longer Enabled is a 401.
            if ($model instanceof BranchModel && ! $this->liveness->liveBranch($model)) {
                return AccountBannedResponse::make();
            }
            if ($model instanceof BarberModel && ! $model->isEnabled) {
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

            // F-05: the claim must have been issued for this exact access token and actor (`tid`, `sub`, `actor_type`).
            if (! $token instanceof PersonalAccessToken || ! $this->claim->matches($sessionClaim, $token->getKey(), $actor)) {
                return $this->unauthorized();
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
