<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Analytics;

use Illuminate\Http\JsonResponse;
use Modules\Admin\Models\AdminModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Analytics\ShowPlatformAnalyticsRequest;
use Modules\Dashboard\Services\PlatformAnalyticsQuery;

final class ShowPlatformAnalyticsAction extends BaseApiAction
{
    public function __construct(private readonly PlatformAnalyticsQuery $query) {}

    public function __invoke(ShowPlatformAnalyticsRequest $request): JsonResponse
    {
        abort_unless($request->user('admin_api') instanceof AdminModel, 403);

        return $this->ok(data: $this->query->overview($request->from(), $request->to()));
    }
}
