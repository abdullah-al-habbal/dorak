<?php

declare(strict_types=1);

namespace Modules\Preference\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Preference\Enums\PreferenceableTypeEnum;
use Modules\Preference\Models\PreferenceModel;
use Modules\Preference\Support\DashboardOwnerResolver;
use Symfony\Component\HttpFoundation\Response;

final class ApplyPreferredLocaleMiddleware
{
    public function handle(Request $request, Closure $next, ?string $guard = null): Response
    {
        [$ownerType, $ownerId] = $this->resolveOwner($request, $guard);

        if ($ownerType !== null && $ownerId !== null) {
            $preferredLanguage = PreferenceModel::query()
                ->toBase()
                ->where('preferenceable_type', $ownerType)
                ->where('preferenceable_id', $ownerId)
                ->value('preferred_language');

            if ($preferredLanguage !== null) {
                App::setLocale($preferredLanguage);
            }
        }

        return $next($request);
    }

    /** @return array{0: ?PreferenceableTypeEnum, 1: ?string} */
    private function resolveOwner(Request $request, ?string $guard): array
    {
        if ($guard === null) {
            /** @var DashboardActor|null $actor */
            $actor = $request->attributes->get('dashboard_actor');

            return $actor === null ? [null, null] : DashboardOwnerResolver::resolve($actor);
        }

        $ownerType = match ($guard) {
            'branch_api' => PreferenceableTypeEnum::Branch,
            default => PreferenceableTypeEnum::tryFrom($guard),
        };

        $user = Auth::guard($guard)->user();

        return $user === null ? [null, null] : [$ownerType, (string) $user->getAuthIdentifier()];
    }
}
