<?php

declare(strict_types=1);

namespace Modules\JobPosting\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\JobPosting\Handlers\Barber\ApplyForJobHandler;
use Modules\JobPosting\Http\Requests\Barber\ApplyForJobRequest;
use Modules\JobPosting\Http\Resources\Barber\ApplicationResource;

final class ApplyForJobAction extends BaseApiAction
{
    public function __construct(
        private readonly ApplyForJobHandler $handler,
    ) {}

    public function __invoke(ApplyForJobRequest $request, string $job): JsonResponse
    {
        $result = $this->handler->handle($request->toCommand($job));

        if (! $result->success) {
            return $this->businessError(
                ErrorCodeEnum::UNPROCESSABLE_ENTITY,
                message: match ($result->errorCode) {
                    'not_open' => __('jobposting::messages.not_open'),
                    'already_applied' => __('jobposting::messages.already_applied'),
                    default => __('core::messages.unprocessable'),
                },
            );
        }

        return $this->created(
            data: new ApplicationResource($result->application),
            message: __('jobposting::messages.application_submitted'),
        );
    }
}
