<?php

declare(strict_types=1);

namespace Modules\Subscription\Handlers;

use Illuminate\Support\Facades\DB;
use Modules\Subscription\Enums\SubscriptionStatus;
use Modules\Subscription\Models\BrandSubscriptionModel;
use Modules\Subscription\Services\PlanFeatureSyncer;

final class UpdateSubscriptionStatusHandler
{
    public function __construct(private readonly PlanFeatureSyncer $syncer) {}

    /** Returns null when the state machine forbids the move. */
    public function handle(BrandSubscriptionModel $subscription, SubscriptionStatus $next): ?BrandSubscriptionModel
    {
        if (! $subscription->status->canTransitionTo($next)) {
            return null;
        }

        return DB::transaction(function () use ($subscription, $next): BrandSubscriptionModel {
            $subscription->update([
                'status' => $next,
                'past_due_at' => match ($next) {
                    SubscriptionStatus::PastDue => now(),
                    default => null,
                },
                'canceled_at' => $next === SubscriptionStatus::Canceled ? now() : $subscription->canceled_at,
            ]);

            $subscription->loadMissing(['brand', 'plan']);
            $next === SubscriptionStatus::Canceled
                ? $this->syncer->revoke($subscription->brand)
                : $this->syncer->grant($subscription->brand, $subscription->plan);

            return $subscription;
        });
    }
}
