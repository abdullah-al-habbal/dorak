<?php

declare(strict_types=1);

namespace Modules\Marketing\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Marketing\Http\Requests\Admin\UpdateMarketingPageRequest;
use Modules\Marketing\Http\Resources\Admin\AdminMarketingPageResource;
use Modules\Marketing\Models\MarketingPageModel;

final class UpdateMarketingPageAction extends BaseApiAction
{
    public function __invoke(UpdateMarketingPageRequest $request, string $page): JsonResponse
    {
        $model = MarketingPageModel::query()->findOrFail($page);
        Gate::forUser($request->user('admin_api'))->authorize('update', $model);

        $model->update($request->validated());

        return $this->updated(data: new AdminMarketingPageResource($model->refresh()->load('sections')), message: __('marketing::marketing.page_saved'));
    }
}
