<?php

declare(strict_types=1);

namespace Modules\Dashboard\Policies;

use Illuminate\Auth\Access\Response;
use Modules\Dashboard\Support\DashboardActor;

/** A brand belongs to a client account (ADR 0001): only an owner creates one, and only its owner (or the platform admin) changes it. */
final class DashboardBrandPolicy
{
    public function create(DashboardActor $actor): Response
    {
        return $actor->isBrandOwner() ? Response::allow() : Response::deny(__('dashboard::messages.brand_owner_only'));
    }

    public function update(DashboardActor $actor, string $brandId): bool
    {
        return $actor->canManageBrand($brandId);
    }
}
