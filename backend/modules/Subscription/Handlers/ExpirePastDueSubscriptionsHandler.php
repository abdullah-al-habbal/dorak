<?php

declare(strict_types=1);

namespace Modules\Subscription\Handlers;

use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;
use Modules\Subscription\Enums\SubscriptionStatus;
use Modules\Subscription\Models\BrandSubscriptionModel;

final class ExpirePastDueSubscriptionsHandler
{
    public function __construct(
        private readonly SettingsService $settings,
        private readonly UpdateSubscriptionStatusHandler $transition,
    ) {}

    /** Cancels (and revokes features of) every past_due subscription beyond the grace window; returns the count. */
    public function handle(): int
    {
        $cutoff = now()->subDays($this->settings->int(SettingKey::SubscriptionGraceDays));
        $canceled = 0;

        BrandSubscriptionModel::query()
            ->where('status', SubscriptionStatus::PastDue)
            ->where('past_due_at', '<=', $cutoff)
            ->each(function (BrandSubscriptionModel $subscription) use (&$canceled): void {
                if ($this->transition->handle($subscription, SubscriptionStatus::Canceled) !== null) {
                    $canceled++;
                }
            });

        return $canceled;
    }
}
