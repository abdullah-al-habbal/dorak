<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\ServiceCategories;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\ServiceCategories\ListServiceCategoriesHandler;
use Modules\Dashboard\Http\Resources\Shared\DashboardServiceCategoryResource;

final class ListServiceCategoriesAction extends BaseApiAction
{
    public function __construct(private readonly ListServiceCategoriesHandler $handler) {}

    public function __invoke(): JsonResponse
    {
        return $this->ok(DashboardServiceCategoryResource::collection($this->handler->handle()));
    }
}
