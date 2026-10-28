<?php

declare(strict_types=1);

namespace Modules\Subscription\Handlers;

use Modules\Subscription\Enums\SubscriptionStatus;
use Modules\Subscription\Models\SubscriptionPlanModel;

final class DeletePlanHandler
{
    /** A plan with live subscriptions is kept; returns whether it was deleted. */
    public function handle(SubscriptionPlanModel $plan): bool
    {
        if ($plan->subscriptions()->whereIn('status', SubscriptionStatus::live())->exists()) {
            return false;
        }

        $plan->delete();

        return true;
    }
}
