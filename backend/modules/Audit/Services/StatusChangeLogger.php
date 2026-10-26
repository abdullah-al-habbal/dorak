<?php

declare(strict_types=1);

namespace Modules\Audit\Services;

use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Models\StatusChangeLogModel;

final class StatusChangeLogger
{
    public function log(
        StatusChangeSubjectTypeEnum $subjectType,
        string $subjectId,
        ?string $fromStatus,
        string $toStatus,
        StatusChangeActorTypeEnum $actorType,
        ?string $actorId,
        ?string $reason = null,
    ): void {
        StatusChangeLogModel::create([
            'subject_type' => $subjectType->value,
            'subject_id' => $subjectId,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'actor_type' => $actorType->value,
            'actor_id' => $actorId,
            'reason' => $reason,
            'created_at' => now(),
        ]);
    }
}
