<?php

declare(strict_types=1);

namespace Modules\Audit\CQRS\Query\Admin;

use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;

final readonly class ListStatusChangeLogsQuery
{
    public function __construct(
        public StatusChangeSubjectTypeEnum $subjectType,
        public string $subjectId,
        public int $perPage,
    ) {}
}
