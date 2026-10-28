<?php

declare(strict_types=1);

namespace Modules\Subscription\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['plan_id', 'feature_key'])]
#[Table('plan_features')]
class PlanFeatureModel extends Model
{
    use HasUuids;

    /** @return BelongsTo<SubscriptionPlanModel, $this> */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlanModel::class, 'plan_id');
    }
}
