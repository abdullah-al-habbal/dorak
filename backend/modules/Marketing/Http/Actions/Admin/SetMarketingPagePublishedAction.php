<?php

declare(strict_types=1);

namespace Modules\Marketing\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Marketing\Http\Requests\Admin\SetMarketingPagePublishedRequest;
use Modules\Marketing\Http\Resources\Admin\AdminMarketingPageResource;
use Modules\Marketing\Models\MarketingPageModel;
use Modules\Marketing\Services\MarketingPagePublisher;

final class SetMarketingPagePublishedAction extends BaseApiAction
{
    public function __construct(
        private readonly MarketingPagePublisher $publisher,
    ) {}

    public function __invoke(SetMarketingPagePublishedRequest $request, string $page): JsonResponse
    {
        $model = MarketingPageModel::query()->findOrFail($page);
        $admin = $request->user('admin_api');
        Gate::forUser($admin)->authorize('update', $model);

        $saved = $this->publisher->set($model, $request->wantsPublished(), (string) $admin->getKey());
        $message = $saved->isPublished() ? __('marketing::marketing.page_published') : __('marketing::marketing.page_unpublished');

        return $this->updated(data: new AdminMarketingPageResource($saved->load('sections')), message: $message);
    }
}
