<?php

declare(strict_types=1);

namespace Modules\Feedback\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Feedback\Http\Requests\Admin\ListFeedbackReportsRequest;
use Modules\Feedback\Http\Resources\Admin\AdminFeedbackReportResource;
use Modules\Feedback\Models\FeedbackReportModel;

final class ListFeedbackReportsAction extends BaseApiAction
{
    public function __invoke(ListFeedbackReportsRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('viewAny', FeedbackReportModel::class);

        $search = $request->string('search')->trim()->toString();

        $reports = FeedbackReportModel::query()
            ->when($request->filled('kind'), fn ($query) => $query->where('kind', $request->string('kind')->toString()))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->filled('app'), fn ($query) => $query->where('app', $request->string('app')->toString()))
            ->when($request->filled('platform'), fn ($query) => $query->where('platform', $request->string('platform')->toString()))
            ->when($search !== '', fn ($query) => $query->where('message', 'like', '%'.addcslashes($search, '%_\\').'%'))
            ->orderByDesc('created_at')
            ->paginate($request->perPage());

        return $this->paginated($reports, AdminFeedbackReportResource::class);
    }
}
