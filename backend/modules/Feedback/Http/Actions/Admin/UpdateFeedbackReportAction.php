<?php

declare(strict_types=1);

namespace Modules\Feedback\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Feedback\Http\Requests\Admin\UpdateFeedbackReportRequest;
use Modules\Feedback\Http\Resources\Admin\AdminFeedbackReportResource;
use Modules\Feedback\Models\FeedbackReportModel;
use Modules\Feedback\Services\FeedbackTriage;

final class UpdateFeedbackReportAction extends BaseApiAction
{
    public function __construct(
        private readonly FeedbackTriage $triage,
    ) {}

    public function __invoke(UpdateFeedbackReportRequest $request, string $report): JsonResponse
    {
        $model = FeedbackReportModel::query()->findOrFail($report);
        $admin = $request->user('admin_api');
        Gate::forUser($admin)->authorize('update', $model);

        $saved = $this->triage->apply($model, $request->validated(), (string) $admin->getKey());

        return $this->updated(data: new AdminFeedbackReportResource($saved), message: __('feedback::messages.updated'));
    }
}
