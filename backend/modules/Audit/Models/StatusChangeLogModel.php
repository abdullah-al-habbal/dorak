<?php

declare(strict_types=1);

namespace Modules\Audit\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;

#[Fillable([
    'subject_type', 'subject_id',
    'from_status', 'to_status',
    'actor_type', 'actor_id',
    'reason', 'created_at',
])]
#[Table('status_change_logs')]
final class StatusChangeLogModel extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'subject_type' => StatusChangeSubjectTypeEnum::class,
            'actor_type' => StatusChangeActorTypeEnum::class,
            'created_at' => 'datetime',
        ];
    }
}
