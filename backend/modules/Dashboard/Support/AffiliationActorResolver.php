<?php

declare(strict_types=1);

namespace Modules\Dashboard\Support;

use Illuminate\Http\Request;
use Modules\BarberAffiliation\ValuesObjects\AffiliationActor;

/** Names the platform admin in the status-change log when they act for a branch; managers and owners keep the branch as actor. */
final readonly class AffiliationActorResolver
{
    public function actingAs(Request $request): ?AffiliationActor
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');

        return $actor->isPlatformAdmin() ? AffiliationActor::admin($actor->id) : null;
    }
}
