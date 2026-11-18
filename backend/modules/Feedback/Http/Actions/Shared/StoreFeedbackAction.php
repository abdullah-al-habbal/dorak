<?php

declare(strict_types=1);

namespace Modules\Feedback\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Feedback\Http\Requests\Shared\StoreFeedbackRequest;
use Modules\Feedback\Models\FeedbackReportModel;
use Modules\Feedback\Services\FeedbackAuthorResolver;

/** `POST /feedback`: open to guests and every signed-in app. Identity comes from the token, never from the body. */
final class StoreFeedbackAction extends BaseApiAction
{
    public function __construct(
        private readonly FeedbackAuthorResolver $authors,
    ) {}

    public function __invoke(StoreFeedbackRequest $request): JsonResponse
    {
        if (! $request->isSpam()) {
            FeedbackReportModel::query()->create([...$request->report(), ...($this->authors->resolve($request) ?? [])]);
        }

        return $this->created(message: __('feedback::messages.received'));
    }
}
