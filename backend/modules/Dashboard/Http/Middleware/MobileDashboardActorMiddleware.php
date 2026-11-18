<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\TokenAbility;
use Modules\Core\Helpers\ApiResponseTrait;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Repositories\DashboardOwnerActorResolver;
use Modules\Dashboard\Support\DashboardActor;
use Symfony\Component\HttpFoundation\Response;

/**
 * Lets mobile-scoped routes (`/branch/...`, `/barber/...`, `/owner/...`) reuse the
 * dashboard Actions. The actor comes from the authenticated branch, barber or
 * client and requires the matching mobile token ability, so mobile tokens never
 * gain `dashboard`. A brand owner is a client account with a brand (ADR 0001):
 * a client with no brand, or one that is not active, is a 403, not a 401.
 */
final class MobileDashboardActorMiddleware
{
    use ApiResponseTrait;

    private const GUARD_BRANCH = 'branch_api';

    private const GUARD_BARBER = 'barber';

    private const GUARD_CLIENT = 'client';

    public function __construct(
        private readonly DashboardOwnerActorResolver $ownerActors,
    ) {}

    /** @param Closure(Request): Response $next */
    public function handle(Request $request, Closure $next, string $guard): Response
    {
        $actor = $this->actorFor($request, $guard);

        if ($actor === null) {
            return $this->isSignedInClient($request, $guard) ? $this->forbidden(__('dashboard::messages.owner_operation_only')) : $this->unauthorized();
        }

        $request->attributes->set('dashboard_actor', $actor);

        return $next($request);
    }

    private function actorFor(Request $request, string $guard): ?DashboardActor
    {
        $model = $request->user($guard);

        if ($guard === self::GUARD_BRANCH && $model instanceof BranchModel && $model->tokenCan(TokenAbility::BranchApp->value)) {
            $id = (string) $model->getKey();
            $brandId = $model->getAttribute('brand_id');

            return new DashboardActor($id, DashboardActorTypeEnum::Branch, 'branch_manager', $id, is_string($brandId) || is_int($brandId) ? (string) $brandId : null);
        }

        if ($guard === self::GUARD_BARBER && $model instanceof BarberModel && $model->tokenCan(TokenAbility::BarberApp->value)) {
            return new DashboardActor((string) $model->getKey(), DashboardActorTypeEnum::Barber, 'barber', null);
        }

        if ($guard === self::GUARD_CLIENT && $model instanceof ClientModel && $model->tokenCan(TokenAbility::ClientActive->value)) {
            return $this->ownerActors->forClient($model);
        }

        return null;
    }

    /** The client is authenticated with a mobile token but owns no usable brand. */
    private function isSignedInClient(Request $request, string $guard): bool
    {
        $model = $request->user($guard);

        return $guard === self::GUARD_CLIENT && $model instanceof ClientModel && $model->tokenCan(TokenAbility::ClientActive->value);
    }
}
