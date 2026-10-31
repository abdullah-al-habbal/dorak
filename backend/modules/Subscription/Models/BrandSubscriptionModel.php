<?php

declare(strict_types=1);

namespace Modules\Subscription\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Brand\Models\BrandModel;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;
use Modules\Subscription\Enums\SubscriptionStatus;

/**
 * @property string $id
 * @property string $brand_id
 * @property string $plan_id
 * @property SubscriptionStatus $status
 * @property CarbonInterface|null $past_due_at
 */
#[Fillable(['brand_id', 'plan_id', 'status', 'starts_at', 'ends_at', 'past_due_at', 'canceled_at'])]
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
            'past_due_at' => 'datetime',
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

    /** Last instant a past_due subscription keeps its features; null unless the subscription is past_due. */
    public function graceEndsAt(): ?CarbonInterface
    {
        if ($this->status !== SubscriptionStatus::PastDue || $this->past_due_at === null) {
            return null;
        }

        return $this->past_due_at->copy()->addDays(app(SettingsService::class)->int(SettingKey::SubscriptionGraceDays));
    }

    public function isGraceExpired(): bool
    {
        return $this->graceEndsAt()?->lte(now()) ?? false;
    }
}
