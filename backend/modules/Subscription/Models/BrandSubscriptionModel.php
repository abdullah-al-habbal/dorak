<?php

declare(strict_types=1);

namespace Modules\Subscription\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Brand\Models\BrandModel;
use Modules\Subscription\Enums\SubscriptionStatus;

/**
 * @property string $id
 * @property string $brand_id
 * @property string $plan_id
 * @property SubscriptionStatus $status
 */
#[Fillable(['brand_id', 'plan_id', 'status', 'starts_at', 'ends_at', 'canceled_at'])]
#[Table('brand_subscriptions')]
class BrandSubscriptionModel extends Model
{
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return [
            'status' => SubscriptionStatus::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'canceled_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<BrandModel, $this> */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(BrandModel::class, 'brand_id');
    }

    /** @return BelongsTo<SubscriptionPlanModel, $this> */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlanModel::class, 'plan_id')->withTrashed();
    }
}
