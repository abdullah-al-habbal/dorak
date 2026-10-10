<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\Support\DashboardActor;
use Symfony\Component\HttpFoundation\Response;

final class DashboardAuthorizationMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        foreach ($this->guards() as $guard) {
            $model = $request->user($guard);
            if (! $model instanceof AdminModel && ! $model instanceof BranchModel && ! $model instanceof BarberModel) {
                continue;
            }

            $token = $model->currentAccessToken();
            if ($token !== null && ! $model->tokenCan('dashboard')) {
                continue;
            }

            $request->attributes->set('dashboard_actor', $this->actorFor($guard, $model));
            $request->attributes->set('dashboard_guard', $guard);
            $request->attributes->set('dashboard_model', $model);
            $request->attributes->set('dashboard_token', $token);

            return $next($request);
        }

        abort(401);
    }

    /** @return list<string> */
    private function guards(): array
    {
        return ['admin_api', 'branch_api', 'barber'];
    }

    private function actorFor(string $guard, AdminModel|BranchModel|BarberModel $model): DashboardActor
    {
        return match ($guard) {
            'admin_api' => new DashboardActor($model->id, DashboardActor::ADMIN, 'platform_admin', null),
            'branch_api' => new DashboardActor($model->id, DashboardActor::BRANCH, 'branch_manager', $model->id, (string) $model->getAttribute('brand_id')),
            'barber' => new DashboardActor($model->id, DashboardActor::BARBER, 'barber', null),
            default => abort(401),
        };
    }
}
