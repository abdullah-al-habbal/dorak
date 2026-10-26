<?php

declare(strict_types=1);

namespace Modules\Audit\Http\Requests\Admin;

use Modules\Audit\CQRS\Query\Admin\ListStatusChangeLogsQuery;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ListStatusChangeLogsRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function toQuery(string $subjectType, string $subjectId): ListStatusChangeLogsQuery
    {
        return new ListStatusChangeLogsQuery(
            subjectType: StatusChangeSubjectTypeEnum::from($subjectType),
            subjectId: $subjectId,
            perPage: (int) ($this->validated('per_page') ?? 20),
        );
    }
}
