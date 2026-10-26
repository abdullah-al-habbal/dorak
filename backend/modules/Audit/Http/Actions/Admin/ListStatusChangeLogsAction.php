<?php

declare(strict_types=1);

namespace Modules\Audit\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Handlers\Admin\ListStatusChangeLogsHandler;
use Modules\Audit\Http\Requests\Admin\ListStatusChangeLogsRequest;
use Modules\Audit\Http\Resources\Admin\StatusChangeLogResource;
use Modules\Core\Http\Actions\BaseApiAction;

final class ListStatusChangeLogsAction extends BaseApiAction
{
    public function __construct(
        private readonly ListStatusChangeLogsHandler $handler,
    ) {}

    public function __invoke(ListStatusChangeLogsRequest $request, string $subjectType, string $subjectId): JsonResponse
    {
        $type = StatusChangeSubjectTypeEnum::tryFrom($subjectType);

        if ($type === null) {
            return $this->unprocessable(message: __('audit::messages.invalid_subject_type'));
        }

        $logs = $this->handler->handle($request->toQuery($type->value, $subjectId));

        return $this->paginated($logs, StatusChangeLogResource::class);
    }
}
