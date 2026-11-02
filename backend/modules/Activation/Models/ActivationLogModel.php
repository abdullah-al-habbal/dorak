<?php

// modules/Activation/Models/ActivationLogModel.php
declare(strict_types=1);

namespace Modules\Activation\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Modules\Activation\Enums\ActivableTypeEnum;
use Modules\Activation\Enums\ActivationStatusEnum;
use Modules\Admin\Models\AdminModel;

#[Fillable([
    'activable_id',
    'activable_type',
    'status',
    'reason',
    'activated_by_id',
    'activated_at',
    'expires_at',
])]
#[Table('activation_logs')]
class ActivationLogModel extends Model
{
    use HasFactory;
    use HasUuids;

    protected function casts(): array
    {
        return [
            'activable_type' => ActivableTypeEnum::class,
            'status' => ActivationStatusEnum::class,
            'activated_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function activable(): MorphTo
    {
        return $this->morphTo();
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(AdminModel::class, 'activated_by_id');
    }
}
