<?php

declare(strict_types=1);

namespace Modules\Subscription\Services;

use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Subscription\Models\SubscriptionPlanModel;

/**
 * Applies a plan's feature mapping to a brand's Pennant flags. Called only when
 * a subscription changes, so manual admin overrides survive in between.
 */
final class PlanFeatureSyncer
{
    public function __construct(private readonly BrandFeatures $features) {}

    public function grant(BrandModel $brand, SubscriptionPlanModel $plan): void
    {
        $granted = $plan->features()->pluck('feature_key')->all();
        $flags = [];
        foreach (BrandFeatures::keys() as $key) {
            $flags[$key] = in_array($key, $granted, true);
        }

        $this->features->set($brand, $flags);
    }

    public function revoke(BrandModel $brand): void
    {
        $this->features->set($brand, array_fill_keys(BrandFeatures::keys(), false));
    }
}
