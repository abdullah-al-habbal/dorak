<?php

declare(strict_types=1);

use Modules\Payment\Enums\PaymentGatewayDriver;
use Modules\Payment\Models\PaymentGatewayModel;
use Modules\ServiceCatalog\Enums\MediaTypeEnum;
use Modules\Subscription\Enums\SubscriptionIntervalUnitEnum;
use Modules\Subscription\Enums\SubscriptionStatus;
use Modules\Subscription\Models\BrandSubscriptionModel;
use Modules\Subscription\Models\SubscriptionPlanModel;

describe('Catalog, subscription and payment enum contract', function (): void {
    it('pins the serialized wire values the dashboard and mobile apps depend on', function (): void {
        expect(array_column(PaymentGatewayDriver::cases(), 'value'))->toBe(['offline'])
            ->and(array_column(SubscriptionStatus::cases(), 'value'))->toBe(['pending', 'active', 'past_due', 'cancelled'])
            ->and(array_column(SubscriptionIntervalUnitEnum::cases(), 'value'))->toBe(['day', 'week', 'month', 'year'])
            ->and(array_column(MediaTypeEnum::cases(), 'value'))->toBe(['image', 'video']);
    });

    it('casts persisted columns to their enums', function (): void {
        expect(PaymentGatewayModel::factory()->create()->fresh()->driver)->toBe(PaymentGatewayDriver::Offline)
            ->and(SubscriptionPlanModel::factory()->create()->fresh()->interval_unit)->toBe(SubscriptionIntervalUnitEnum::Month)
            ->and(BrandSubscriptionModel::factory()->create()->fresh()->status)->toBe(SubscriptionStatus::Active);
    });
});
