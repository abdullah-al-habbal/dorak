<?php

declare(strict_types=1);

namespace Modules\Feedback\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Feedback\Http\Resources\Admin\AdminFeedbackReportResource;
use Modules\Feedback\Models\FeedbackReportModel;

final class ShowFeedbackReportAction extends BaseApiAction
{
    public function __invoke(Request $request, string $report): JsonResponse
    {
        $model = FeedbackReportModel::query()->findOrFail($report);
        Gate::forUser($request->user('admin_api'))->authorize('view', $model);

        return $this->success(data: new AdminFeedbackReportResource($model));
    }
}
