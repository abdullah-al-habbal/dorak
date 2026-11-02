<?php

declare(strict_types=1);

namespace Modules\Branch\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['branch_id', 'override_date', 'opens_time', 'closes_time', 'is_closed'])]
#[Table('branch_hours_overrides')]
final class BranchHoursOverrideModel extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'override_date' => 'date:Y-m-d',
            'is_closed' => 'boolean',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(BranchModel::class, 'branch_id');
    }
}
